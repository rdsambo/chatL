import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  // addDoc,
  // collection,
  doc,
  // serverTimestamp,
  getDoc,
  setDoc,
  // updateDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
// import {
//   Routes,
//   Route,
//   BrowserRouter
// } from "react-router-dom"
import { 
  useSearchParams,
  // useNavigate 
} from "react-router-dom";
import { auth, db } from "../core/firebaseConfig";
import LeftSide from "../components/LeftSide";
import { User } from "../core/types";
import RightSide from "../components/RightSide";

export default function Home() {
  const [queryParameters] = useSearchParams();
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
  const [canLogin, setCanLogin] = useState(false);

  useEffect(() => {
    console.log('effect');
      // let email = 'NewOne3EmailAddress@gmail.com';
      // let password = 'userid';
      let email = queryParameters.get("email");
      let password = queryParameters.get("userid");
      if(email){} else email = "";
      if(password){} else password = "";
      password = password + password;
      // const email = Liferay.ThemeDisplay.getUserEmailAddress();
      // const password = Liferay.ThemeDisplay.getUserId();
      
      console.log('email');
      console.log(email);
      console.log('password');
      console.log(password);
      signOut(auth);

      signInWithEmailAndPassword(auth, email, password)
      .then(() => loadUser())
      .catch((e) => 
      {
        console.log('e');
        console.log(typeof e);
        console.log(JSON.stringify(e));
        if(e.code === 'auth/user-not-found' )
        {
          if(email) if(password)
          createUser(email, password);
        }
      });
  }, [canLogin]);

  const createUser = (email: string, password: string) => {
    // let email = 'getUserEmailAddress@gmail.com';
    // let password = 'userid';
    let userName = queryParameters.get("username");
    // let userName = 'username afdfs';
    // let email = queryParameters.get("email");
    // let password = queryParameters.get("userid");
    // console.log("createUser");
    // console.log("email:"+email);
    
    // if(email){} else email = "";
    // if(password){} else password = "";
    // password = password + password;
    if(userName){} else userName = "";
    // const email = Liferay.ThemeDisplay.getUserEmailAddress();
    // const password = Liferay.ThemeDisplay.getUserId();
    // const userName = Liferay.ThemeDisplay.getUserName();
    const userNameS = userName.split(' ');
    const fName = userNameS[0];
    let lName = " ";
    if (userNameS[1]) {
      lName = userName.replace(userNameS[0], '');
    }
    const birthday = "";
    createUserWithEmailAndPassword(auth, email, password)
    .then((user) => {
      if(email){} else email = "";
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
      setCanLogin(true);
      // addDoc(collection(db, "chats"), {
      //   createdAt: serverTimestamp(),
      //   lastMessage: "",
      //   updatedAt: serverTimestamp(),
      //   userIds: [user.user.uid, "rmbJQucAbjQvll9pV341OB8hxnx2"],
      //   id: "",
      // }).then((docRef) => {
      //   updateDoc(doc(db, "chats", docRef.id), { id: docRef.id });
      //   // addDoc(collection(db, "messages"), {
      //   //   chatId: docRef.id,
      //   //   message:
      //   //     "Hello i'm Islem medjahdi, I'm a computer science student in Algeria - Algiers, If you have any questions, let me know and don't forget to check my portfolio : https://islem-medjahdi-portfolio.vercel.app/",
      //   //   sender: "rmbJQucAbjQvll9pV341OB8hxnx2",
      //   //   type: "text",
      //   //   createdAt: serverTimestamp(),
      //   // }).then((docRef) => {
      //   //   updateDoc(doc(db, "messages", docRef.id), {
      //   //     messageId: docRef.id,
      //   //   });
      //   // });
      //   // updateDoc(doc(db, "chats", docRef.id), {
      //   //   updatedAt: serverTimestamp(),
      //   //   message:
      //   //     "Hello i'm Islem medjahdi, I'm a computer science student in Algeria - Algiers, If you have any questions, let me know and don't forget to check my portfolio : https://islem-medjahdi-portfolio.vercel.app/",
      //   // });
      // });
    })
    // .catch((e) => setError(e.code))
    // .finally(() => setLoading(false))
    ;
  };

  const loadUser = () => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      console.log('check status');
        console.log('is not loading');
        if (currentUser) {
          console.log('with currentUser');
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
        }
    });
    return unsub;
  }
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
