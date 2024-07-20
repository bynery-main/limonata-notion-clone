// pages/Page.tsx
"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import ComponentLayout from "./../components/landing-page-component"; // Adjust the path if necessary
import Card, { CardContent, CardHeader } from "./../components/ui/card"; 
import Badge from "./../components/ui/badge"; 
import Button from "./../components/ui/button"; 


export default function Home() {
  const provider = new GoogleAuthProvider();
  const login = () => {
    signInWithPopup(auth, provider)
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <ComponentLayout>
      <Card>
        <CardHeader>
          <h2>
            Welcome <Badge color="bg-green-500">New</Badge>
          </h2>
        </CardHeader>
        <CardContent>
          <Button onClick={login} className="btn btn-primary">
            Click me
          </Button>
        </CardContent>
      </Card>
    </ComponentLayout>
  );
}
