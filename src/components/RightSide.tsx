import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState, memo } from "react";
import emptyProfile from "../assets/empty-profile.png";
import { db } from "../core/firebaseConfig";
import { Message as MessageType } from "../core/types";
import Message from "./Message";
import Profile from "./Profile";
import ChatHeader from "./ChatHeader";
import MessageForm from "./MessageForm";
import background from "../assets/ine_background.png"

type Props = {
  chatRoomId: string;
  userId?: string;
  setOpen: (b: boolean) => void;
  lName: string;
  fName: string;
  picture?: string;
};

type TypeSelectedFriend = {
  picture: string;
  lName: string;
  fName: string;
  email: string;
};

export default memo(function RightSide({
  chatRoomId,
  userId,
  setOpen,
  picture,
  fName,
  lName,
}: Props) {
  const [selectedMessage, setSelectedMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>();
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const dummyRef = useRef<HTMLDivElement>(null);
  const [selectedFriend, setSelectedFriend] = useState<TypeSelectedFriend>();
  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() !== "") {
      setLoading(true);
      addDoc(collection(db, "messages"), {
        chatId: chatRoomId,
        message: newMessage,
        sender: userId,
        type: "text",
        createdAt: serverTimestamp(),
        isRead: false,
      }).then((docRef) => {
        updateDoc(doc(db, "messages", docRef.id), {
          messageId: docRef.id,
        }).then(() => {
          updateDoc(doc(db, "chats", chatRoomId), {
            updatedAt: serverTimestamp(),
            lastMessage: newMessage,
          }).finally(() => {
            setLoading(false);
            setNewMessage("");
          });
        });
      });
      const el = dummyRef.current;
      if(el)
        if( el.scrollWidth > el.getBoundingClientRect().width)
          dummyRef.current?.scrollIntoView({
            behavior: "smooth",
          });
    }
  };
  useEffect(() => {
    if (chatRoomId) {
      const q = query(
        collection(db, "messages"),
        where("chatId", "==", chatRoomId),
        orderBy("createdAt")
      );
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          const messages: MessageType[] = [];
          querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            let message = doc.data();
            message = { ...message, isRead: true };
            messages.push(message as MessageType);
            if ('messageId' in message && message.sender !== userId){
              markMessageAsRead(message.messageId);
            }
          });
          setMessages(messages);
        }
      );
      return unsubscribe;
    }
  }, [chatRoomId]);
  function markMessageAsRead(messageId: any) {
    const messageRef = doc(db, "messages", messageId); // Obtém a referência do documento
    try {
      updateDoc(messageRef, {
        isRead: true
      });
      console.log("Documento atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar o documento: ", error);
    }
  }
  useEffect(() => {
    if (chatRoomId) {
      setSelectedFriend({ email: "", fName: "", lName: "", picture: "" });
      getDoc(doc(db, "chats", chatRoomId)).then((res) => {
        if (res.exists()) {
          getDoc(
            doc(
              db,
              "users",
              res.data().userIds[0] === userId
                ? res.data().userIds[1]
                : res.data().userIds[0]
            )
          ).then((res) => {
            if (res.exists()) {
              setSelectedFriend(res.data() as TypeSelectedFriend);
            }
          });
        }
      });
    }
  }, [chatRoomId, userId]);
  if (!chatRoomId) {
    return <Profile setOpen={setOpen} />;
  }
  return (
    <div
      className="col-span-7 bg-repeat !bg-opacity-5 overflow-auto md:col-span-4 xl:col-span-5 bg-gray-100 flex-col min-h-screen flex justify-between"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <ChatHeader
        setOpen={setOpen}
        email={selectedFriend?.email || "_____________"}
        fName={selectedFriend?.fName || "_____"}
        lName={selectedFriend?.lName || "______"}
        picture={selectedFriend?.picture || emptyProfile}
      />
      <div className="flex flex-col overflow-auto scrollbar-none px-5 py-4 ">
        {messages?.map((message, index) => (
          <Message
            key={message.messageId || -1}
            text={message.message}
            sender={message.sender === userId}
            createdAt={message.createdAt}
            selectedMessage={selectedMessage}
            messageId={message.messageId || "-1"}
            setSelectedMessage={() => setSelectedMessage(message.messageId)}
            isFirstMessage={
              index !== 0 && index + 1 !== messages.length
                ? message.sender !== messages[index - 1].sender &&
                  message.sender === messages[index + 1].sender
                : index === 0
                ? true
                : index + 1 === messages.length
                ? message.sender !== messages[index - 1].sender
                : false
            }
            isLastMessage={
              index !== 0 && index + 1 !== messages.length
                ? message.sender !== messages[index + 1].sender &&
                  message.sender === messages[index - 1].sender
                : index + 1 === messages.length
                ? true
                : index === 0
                ? message.sender !== messages[index + 1].sender
                : false
            }
          />
        ))}
        <div className="py-4" ref={dummyRef} />
      </div>
      <div className="sticky bottom-0 px-5 pb-4">
        <MessageForm
          loading={loading}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          submitHandler={submitHandler}
        />
      </div>
    </div>
  );
});
