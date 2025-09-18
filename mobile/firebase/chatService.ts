import { db, storage } from "@/firebase/firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  limit,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  deleteField,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { patientService, PatientInfo } from "@/services/patientService";
import { doctorService, DoctorInfo } from "@/services/doctorService";

export type FireMessage = {
  id: string;
  senderId: string;
  content?: string;
  type: "text" | "image" | "audio" | "file";
  imageUrl?: string | null;
  audioUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  delivered?: boolean;
  isRead: boolean;
  createdAt: Timestamp | null;
};

const roomIdFor = (patientId: string, doctorId: string) =>
  `patient_${patientId}__doctor_${doctorId}`;

export const ensureChatRoom = async (
  patientId: string,
  doctorId: string
): Promise<string> => {
  console.log("ensureChatRoom: Starting with patientId:", patientId, "doctorId:", doctorId);
  const rid = roomIdFor(patientId, doctorId);
  console.log("ensureChatRoom: Generated roomId:", rid);
  
  const roomRef = doc(db, "chatRooms", rid);
  console.log("ensureChatRoom: Room reference created");
  
  try {
    const snap = await getDoc(roomRef);
    console.log("ensureChatRoom: getDoc result - exists:", snap.exists());
    
    if (!snap.exists()) {
      console.log("ensureChatRoom: Room doesn't exist, creating new room");
      const roomData = {
        patientId,
        doctorId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
      };
      console.log("ensureChatRoom: Room data to create:", roomData);
      
      await setDoc(roomRef, roomData);
      console.log("ensureChatRoom: Room created successfully");
    } else {
      console.log("ensureChatRoom: Room already exists");
    }
  } catch (error) {
    console.error("ensureChatRoom: Error occurred:", error);
    throw error;
  }
  
  return rid;
};

export const subscribeToMessages = (
  roomId: string,
  onChange: (msgs: FireMessage[]) => void,
  opts?: { limit?: number }
): Unsubscribe => {
  const msgsRef = collection(db, "chatRooms", roomId, "messages");
  const base = query(msgsRef, orderBy("createdAt", "asc"));
  // When limiting, fetch the most recent N by ordering desc
  const q = opts?.limit ? query(msgsRef, orderBy("createdAt", "desc"), limit(opts.limit)) : base;
  return onSnapshot(q, (snap) => {
    const messages: FireMessage[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      messages.push({
        id: d.id,
        senderId: data.senderId,
        content: data.content ?? undefined,
        type: (data.type as any) ?? "text",
        imageUrl: data.imageUrl ?? null,
        audioUrl: data.audioUrl ?? null,
        fileUrl: data.fileUrl ?? null,
        fileName: data.fileName ?? null,
        fileSize: data.fileSize ?? null,
        mimeType: data.mimeType ?? null,
        delivered: !!data.delivered,
        isRead: !!data.isRead,
        createdAt: data.createdAt ?? null,
      });
    });
    // If we queried in descending order due to a limit, reverse back to chronological for UI
    const output = opts?.limit ? messages.reverse() : messages;
    onChange(output);
  });
};

export const markMessagesRead = async (
  roomId: string,
  myUserId: string
) => {
  const msgsRef = collection(db, "chatRooms", roomId, "messages");
  const q = query(msgsRef, where("isRead", "==", false));
  const snap = await getDocs(q);
  const updates: Promise<any>[] = [];
  snap.forEach((d) => {
    const data = d.data() as any;
    if (data.senderId !== myUserId) {
      updates.push(updateDoc(d.ref, { isRead: true }));
    }
  });
  await Promise.allSettled(updates);
};

// Update a text message's content. Only the original sender can edit.
export const updateTextMessage = async (
  roomId: string,
  messageId: string,
  senderId: string,
  content: string
) => {
  const msgRef = doc(db, "chatRooms", roomId, "messages", messageId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;
  const data = snap.data() as any;
  if (data.senderId !== senderId) {
    throw new Error("Not allowed to edit this message");
  }
  await updateDoc(msgRef, {
    content,
    type: "text",
    updatedAt: serverTimestamp(),
  });
  // Touch the room for ordering; avoid forcing lastMessage to prevent inconsistency
  await updateDoc(doc(db, "chatRooms", roomId), {
    updatedAt: serverTimestamp(),
  });
};

// Delete a message. Only the original sender can delete.
export const deleteMessage = async (
  roomId: string,
  messageId: string,
  requesterId: string
) => {
  const msgRef = doc(db, "chatRooms", roomId, "messages", messageId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;
  const data = snap.data() as any;
  if (data.senderId !== requesterId) {
    throw new Error("Not allowed to delete this message");
  }
  await deleteDoc(msgRef);
  await updateDoc(doc(db, "chatRooms", roomId), {
    updatedAt: serverTimestamp(),
  });
};

async function uriToBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  const blob = await res.blob();
  return blob as Blob;
}

async function uploadFileAndGetUrl(
  roomId: string,
  folder: "images" | "audio" | "files",
  uri: string
): Promise<string> {
  const blob = await uriToBlob(uri);
  const name = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const storageRef = ref(storage, `chatRooms/${roomId}/${folder}/${name}`);
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);
  return url;
}

export const sendTextMessage = async (
  roomId: string,
  senderId: string,
  content: string
) => {
  const msgsRef = collection(db, "chatRooms", roomId, "messages");
  await addDoc(msgsRef, {
    senderId,
    content,
    type: "text",
    delivered: false,
    isRead: false,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "chatRooms", roomId), {
    lastMessage: content,
    updatedAt: serverTimestamp(),
  });
};

export const sendImageMessage = async (
  roomId: string,
  senderId: string,
  uri: string
) => {
  const imageUrl = await uploadFileAndGetUrl(roomId, "images", uri);
  const msgsRef = collection(db, "chatRooms", roomId, "messages");
  await addDoc(msgsRef, {
    senderId,
    type: "image",
    imageUrl,
    delivered: false,
    isRead: false,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "chatRooms", roomId), {
    lastMessage: "[Image]",
    updatedAt: serverTimestamp(),
  });
};

export const sendAudioMessage = async (
  roomId: string,
  senderId: string,
  uri: string
) => {
  const audioUrl = await uploadFileAndGetUrl(roomId, "audio", uri);
  const msgsRef = collection(db, "chatRooms", roomId, "messages");
  await addDoc(msgsRef, {
    senderId,
    type: "audio",
    audioUrl,
    delivered: false,
    isRead: false,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "chatRooms", roomId), {
    lastMessage: "[Audio]",
    updatedAt: serverTimestamp(),
  });
};

export const sendFileMessage = async (
  roomId: string,
  senderId: string,
  uri: string,
  meta?: { name?: string; size?: number; mimeType?: string }
) => {
  const fileUrl = await uploadFileAndGetUrl(roomId, "files", uri);
  const msgsRef = collection(db, "chatRooms", roomId, "messages");
  await addDoc(msgsRef, {
    senderId,
    type: "file",
    fileUrl,
    fileName: meta?.name ?? null,
    fileSize: meta?.size ?? null,
    mimeType: meta?.mimeType ?? null,
    delivered: false,
    isRead: false,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "chatRooms", roomId), {
    lastMessage: meta?.name ? `[File] ${meta.name}` : "[File]",
    updatedAt: serverTimestamp(),
  });
};

// Mark messages addressed to me in this room as delivered (recipient received them)
export const markMessagesDelivered = async (
  roomId: string,
  myUserId: string
) => {
  const msgsRef = collection(db, "chatRooms", roomId, "messages");
  const q = query(msgsRef, where("delivered", "==", false));
  const snap = await getDocs(q);
  const updates: Promise<any>[] = [];
  snap.forEach((d) => {
    const data = d.data() as any;
    if (data.senderId !== myUserId) {
      updates.push(updateDoc(d.ref, { delivered: true }));
    }
  });
  await Promise.allSettled(updates);
};

// Get room metadata like createdAt
export const getChatRoomMeta = async (
  roomId: string
): Promise<{ createdAt: Timestamp | null }> => {
  const roomRef = doc(db, "chatRooms", roomId);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return { createdAt: null };
  const data = snap.data() as any;
  return { createdAt: data.createdAt ?? null };
};

// Subscribe to room document (for typing indicators, lastMessage, etc.)
export const subscribeToRoom = (
  roomId: string,
  onChange: (room: { typingBy?: Record<string, Timestamp | null>; lastMessage?: string | null; createdAt?: Timestamp | null; updatedAt?: Timestamp | null } | null) => void
): Unsubscribe => {
  const roomRef = doc(db, "chatRooms", roomId);
  return onSnapshot(roomRef, (snap) => {
    if (!snap.exists()) {
      onChange(null);
      return;
    }
    const data = snap.data() as any;
    onChange({
      typingBy: data.typingBy || undefined,
      lastMessage: data.lastMessage ?? null,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    });
  });
};

// Set or clear typing using a per-user timestamp map under chatRooms/{roomId}/typingBy
export const setTyping = async (
  roomId: string,
  userId: string,
  typing: boolean
): Promise<void> => {
  const roomRef = doc(db, "chatRooms", roomId);
  const path = `typingBy.${userId}` as any;
  await updateDoc(roomRef, typing ? { [path]: serverTimestamp(), updatedAt: serverTimestamp() } : { [path]: deleteField(), updatedAt: serverTimestamp() });
};

// Enhanced chat room type with patient information
export type EnrichedChatRoom = {
  id: string;
  patientId: string;
  doctorId: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  lastMessage: string | null;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  doctorName?: string;
  doctorEmail?: string;
  doctorPhone?: string;
};

// Get all chat rooms for a doctor with patient names
export const getChatRoomsForDoctor = async (doctorId: string): Promise<EnrichedChatRoom[]> => {
  try {
    const roomsRef = collection(db, "chatRooms");
    const q = query(roomsRef, where("doctorId", "==", doctorId));
    const snap = await getDocs(q);
    
    const rooms: any[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      rooms.push({
        id: doc.id,
        patientId: data.patientId,
        doctorId: data.doctorId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastMessage: data.lastMessage,
      });
    });

    // Enrich with patient names
    return await enrichChatRoomsWithPatientNames(rooms);
  } catch (error) {
    console.error("Error fetching chat rooms for doctor:", error);
    return [];
  }
};

// Get all chat rooms for a patient with doctor names
export const getChatRoomsForPatient = async (patientId: string): Promise<EnrichedChatRoom[]> => {
  try {
    const roomsRef = collection(db, "chatRooms");
    const q = query(roomsRef, where("patientId", "==", patientId));
    const snap = await getDocs(q);
    
    const rooms: any[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      rooms.push({
        id: doc.id,
        patientId: data.patientId,
        doctorId: data.doctorId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastMessage: data.lastMessage,
      });
    });

    // Enrich with doctor names
    return await enrichChatRoomsWithDoctorNames(rooms);
  } catch (error) {
    console.error("Error fetching chat rooms for patient:", error);
    return [];
  }
};

// Enrich chat rooms with patient names (similar to webapp implementation)
export const enrichChatRoomsWithPatientNames = async (rooms: any[]): Promise<EnrichedChatRoom[]> => {
  const enrichedRooms = await Promise.all(
    rooms.map(async (room) => {
      try {
        if (room.patientId) {
          const patient = await patientService.getPatientById(room.patientId);
          return {
            ...room,
            patientName: patient?.name || `Patient ${room.patientId}`,
            patientEmail: patient?.email,
            patientPhone: patient?.phoneNumber
          };
        }
        return room;
      } catch (error) {
        console.warn(`Failed to fetch patient ${room.patientId}:`, error);
        return {
          ...room,
          patientName: `Patient ${room.patientId}`
        };
      }
    })
  );
  return enrichedRooms;
};

// Enrich chat rooms with doctor names (for patient view)
export const enrichChatRoomsWithDoctorNames = async (rooms: any[]): Promise<EnrichedChatRoom[]> => {
  const enrichedRooms = await Promise.all(
    rooms.map(async (room) => {
      try {
        if (room.doctorId) {
          const doctor = await doctorService.getDoctorById(room.doctorId);
          return {
            ...room,
            doctorName: doctor?.name || `Doctor ${room.doctorId}`,
            doctorEmail: doctor?.email,
            doctorPhone: doctor?.phoneNumber
          };
        }
        return room;
      } catch (error) {
        console.warn(`Failed to fetch doctor ${room.doctorId}:`, error);
        return {
          ...room,
          doctorName: `Doctor ${room.doctorId}`
        };
      }
    })
  );
  return enrichedRooms;
};

// Get patient name for a specific patient ID (utility function)
export const getPatientName = async (patientId: string): Promise<string> => {
  try {
    const patient = await patientService.getPatientById(patientId);
    return patient?.name || `Patient ${patientId}`;
  } catch (error) {
    console.warn(`Failed to fetch patient name for ${patientId}:`, error);
    return `Patient ${patientId}`;
  }
};

// Get doctor name for a specific doctor ID (utility function)
export const getDoctorName = async (doctorId: string): Promise<string> => {
  try {
    const doctor = await doctorService.getDoctorById(doctorId);
    return doctor?.name || `Doctor ${doctorId}`;
  } catch (error) {
    console.warn(`Failed to fetch doctor name for ${doctorId}:`, error);
    return `Doctor ${doctorId}`;
  }
};
