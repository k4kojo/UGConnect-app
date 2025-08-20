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
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

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
  onChange: (msgs: FireMessage[]) => void
): Unsubscribe => {
  const msgsRef = collection(db, "chatRooms", roomId, "messages");
  const q = query(msgsRef, orderBy("createdAt", "asc"));
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
    onChange(messages);
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
