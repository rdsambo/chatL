import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../core/firebaseConfig";
import LeftSide from "../components/LeftSide";
import { User } from "../core/types";
import RightSide from "../components/RightSide";

export default function Home() {
  const [selectedChatRoom, setSelectedChatRoom] = useState<string>("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    window.addEventListener("resize", () => setWindowWidth(window.innerWidth));
    return () =>
      window.removeEventListener("resize", () =>
        setWindowWidth(window.innerWidth)
      );
  }, []);
  const [user, setUser] = useState<User>();
  const [openChat, setOpenChat] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        getDoc(doc(db, "users", currentUser.uid)).then((res) => {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            birthday: res.data()?.birthday,
            fName: res.data()?.fName,
            lName: res.data()?.lName,
            picture: res.data()?.picture,
          });
        });
      } else {
        // navigate("/login", { replace: true });
        const email = 'getUserEmailAddress@gmail.com';
        const password = 'userid';
        // const email = Liferay.ThemeDisplay.getUserEmailAddress();
        // const password = Liferay.ThemeDisplay.getUserId();
        signInWithUser(email, password);
      }
    });
    return unsub;
  }, [navigate]);
  
  const createUser = () => {
    const email = 'getUserEmailAddress@gmail.com';
    const password = 'userid';
    const userName = 'User Name';
    // const email = Liferay.ThemeDisplay.getUserEmailAddress();
    // const password = Liferay.ThemeDisplay.getUserId();
    // const userName = Liferay.ThemeDisplay.getUserName();
    const userNameS = userName.split(' ');
    const fName = userNameS[0];
    let lName = "";
    if (userNameS[1]) {
      lName = userName.replace(userNameS[0], '');
    }
    const birthday = ""; 
    createUserWithEmailAndPassword(auth, email, password)
    .then((user) => {
      const userData = {
        fName,
        lName,
        birthday,
        email,
        uid: user.user.uid,
        picture: "",
        search: [
          lName.toLowerCase(),
          fName.toLowerCase(),
          email.toLowerCase(),
          fName.toLowerCase() + " " + lName.toLowerCase(),
        ],
      };
      setDoc(doc(db, "users", user.user.uid), userData);
      addDoc(collection(db, "chats"), {
        createdAt: serverTimestamp(),
        lastMessage: "",
        updatedAt: serverTimestamp(),
        userIds: [user.user.uid, "rmbJQucAbjQvll9pV341OB8hxnx2"],
        id: "",
      }).then((docRef) => {
        updateDoc(doc(db, "chats", docRef.id), { id: docRef.id });
        // addDoc(collection(db, "messages"), {
        //   chatId: docRef.id,
        //   message:
        //     "Hello i'm Islem medjahdi, I'm a computer science student in Algeria - Algiers, If you have any questions, let me know and don't forget to check my portfolio : https://islem-medjahdi-portfolio.vercel.app/",
        //   sender: "rmbJQucAbjQvll9pV341OB8hxnx2",
        //   type: "text",
        //   createdAt: serverTimestamp(),
        // }).then((docRef) => {
        //   updateDoc(doc(db, "messages", docRef.id), {
        //     messageId: docRef.id,
        //   });
        // });
        // updateDoc(doc(db, "chats", docRef.id), {
        //   updatedAt: serverTimestamp(),
        //   message:
        //     "Hello i'm Islem medjahdi, I'm a computer science student in Algeria - Algiers, If you have any questions, let me know and don't forget to check my portfolio : https://islem-medjahdi-portfolio.vercel.app/",
        // });
      });
    })
    // .catch((e) => setError(e.code))
    // .finally(() => setLoading(false))
    ;
  };
  const signInWithUser = (email: string, password: string) => {
    signInWithEmailAndPassword(auth, email, password)
      .catch((e) => createUser())
      // .finally(() => setLoading(false))
      ;
  };
  return (
    <div className="grid overflow-auto grid-cols-7 font-jakarta h-screen">
      {(openChat || windowWidth > 768) && (
        <LeftSide
          setOpen={setOpenChat}
          selectedChatRoom={selectedChatRoom}
          setSelectedChatRoom={setSelectedChatRoom}
          picture={user?.picture}
          userId={user?.uid}
          displayName={(user?.fName || "____") + " " + (user?.lName || "____")}
        />
      )}
      {(!openChat || windowWidth > 768) && (
        <RightSide
          setOpen={setOpenChat}
          userId={user?.uid}
          chatRoomId={selectedChatRoom}
          picture={user?.picture}
          fName={user?.fName || "____"}
          lName={user?.lName || "____"}
        />
      )}
    </div>
  );
}
