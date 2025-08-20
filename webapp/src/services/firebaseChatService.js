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
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from '../config/firebaseConfig.js';

export const FireMessage = {
  id: '',
  senderId: '',
  content: '',
  type: 'text', // 'text' | 'image' | 'audio' | 'file'
  imageUrl: null,
  audioUrl: null,
  fileUrl: null,
  fileName: null,
  fileSize: null,
  mimeType: null,
  delivered: false,
  isRead: false,
  createdAt: null,
};

const roomIdFor = (patientId, doctorId) =>
  `patient_${patientId}__doctor_${doctorId}`;

export const ensureChatRoom = async (patientId, doctorId) => {
  const rid = roomIdFor(patientId, doctorId);
  const roomRef = doc(db, "chatRooms", rid);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) {
    await setDoc(roomRef, {
      patientId,
      doctorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
    });
  }
  return rid;
};

export const subscribeToMessages = (roomId, onChange) => {
  const msgsRef = collection(db, "chatRooms", roomId, "messages");
  const q = query(msgsRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const messages = [];
    snap.forEach((d) => {
      const data = d.data();
      messages.push({
        id: d.id,
        senderId: data.senderId,
        content: data.content ?? undefined,
        type: data.type ?? "text",
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

export const markMessagesRead = async (roomId, myUserId) => {
  const msgsRef = collection(db, "chatRooms", roomId, "messages");
  const q = query(msgsRef, where("isRead", "==", false));
  const snap = await getDocs(q);
  const updates = [];
  snap.forEach((d) => {
    const data = d.data();
    if (data.senderId !== myUserId) {
      updates.push(updateDoc(d.ref, { isRead: true }));
    }
  });
  await Promise.allSettled(updates);
};

// Update a text message's content. Only the original sender can edit.
export const updateTextMessage = async (roomId, messageId, senderId, content) => {
  const msgRef = doc(db, "chatRooms", roomId, "messages", messageId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;
  const data = snap.data();
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
export const deleteMessage = async (roomId, messageId, requesterId) => {
  const msgRef = doc(db, "chatRooms", roomId, "messages", messageId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;
  const data = snap.data();
  if (data.senderId !== requesterId) {
    throw new Error("Not allowed to delete this message");
  }
  await deleteDoc(msgRef);
  await updateDoc(doc(db, "chatRooms", roomId), {
    updatedAt: serverTimestamp(),
  });
};

async function fileToBlob(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result], { type: file.type });
      resolve(blob);
    };
    reader.readAsArrayBuffer(file);
  });
}

async function uploadFileAndGetUrl(roomId, folder, file) {
  const blob = await fileToBlob(file);
  const name = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const storageRef = ref(storage, `chatRooms/${roomId}/${folder}/${name}`);
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);
  return url;
}

export const sendTextMessage = async (roomId, senderId, content) => {
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

export const sendImageMessage = async (roomId, senderId, file) => {
  const imageUrl = await uploadFileAndGetUrl(roomId, "images", file);
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

export const sendAudioMessage = async (roomId, senderId, file) => {
  const audioUrl = await uploadFileAndGetUrl(roomId, "audio", file);
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

export const sendFileMessage = async (roomId, senderId, file) => {
  const fileUrl = await uploadFileAndGetUrl(roomId, "files", file);
  const msgsRef = collection(db, "chatRooms", roomId, "messages");
  await addDoc(msgsRef, {
    senderId,
    type: "file",
    fileUrl,
    fileName: file.name ?? null,
    fileSize: file.size ?? null,
    mimeType: file.type ?? null,
    delivered: false,
    isRead: false,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "chatRooms", roomId), {
    lastMessage: file.name ? `[File] ${file.name}` : "[File]",
    updatedAt: serverTimestamp(),
  });
};

// Mark messages addressed to me in this room as delivered (recipient received them)
export const markMessagesDelivered = async (roomId, myUserId) => {
  const msgsRef = collection(db, "chatRooms", roomId, "messages");
  const q = query(msgsRef, where("delivered", "==", false));
  const snap = await getDocs(q);
  const updates = [];
  snap.forEach((d) => {
    const data = d.data();
    if (data.senderId !== myUserId) {
      updates.push(updateDoc(d.ref, { delivered: true }));
    }
  });
  await Promise.allSettled(updates);
};

// Get room metadata like createdAt
export const getChatRoomMeta = async (roomId) => {
  const roomRef = doc(db, "chatRooms", roomId);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return { createdAt: null };
  const data = snap.data();
  return { createdAt: data.createdAt ?? null };
};

// Get all chat rooms for a patient (used by mobile app)
export const getPatientChatRooms = async (patientId) => {
  const roomsRef = collection(db, "chatRooms");
  const q = query(
    roomsRef,
    where("patientId", "==", patientId)
  );
  const snap = await getDocs(q);
  const rooms = [];
  snap.forEach((d) => {
    const data = d.data();
    rooms.push({
      id: d.id,
      ...data,
    });
  });
  return rooms;
};

// Get all chat rooms for a doctor
export const getDoctorChatRooms = async (doctorId) => {
  const roomsRef = collection(db, "chatRooms");
  const q = query(
    roomsRef,
    where("doctorId", "==", doctorId)
  );
  const snap = await getDocs(q);
  const rooms = [];
  snap.forEach((d) => {
    const data = d.data();
    rooms.push({
      id: d.id,
      ...data,
    });
  });
  return rooms;
};

// Create a chat room between a patient and doctor
export const createPatientDoctorChat = async (patientId, doctorId) => {
  try {
    const roomId = await ensureChatRoom(patientId, doctorId);
    return roomId;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

// Get chat room statistics for admin dashboard (no message content)
export const getChatRoomStats = async () => {
  const roomsRef = collection(db, "chatRooms");
  const snap = await getDocs(roomsRef);
  const stats = {
    totalRooms: 0,
    activeRooms: 0,
    totalMessages: 0
  };
  
  snap.forEach((d) => {
    const data = d.data();
    stats.totalRooms++;
    if (data.lastMessage) {
      stats.activeRooms++;
    }
  });
  
  return stats;
};
