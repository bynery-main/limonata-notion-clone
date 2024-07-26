import { Button } from "@/components/ui/button";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig"; // Adjust the path if necessary
import CircleGradients from "./Circle-Gradients.svg";
import inputTypesImage from './Images/Input-Types-Images.png';




export default function LandingPageComponent() {
  const provider = new GoogleAuthProvider();

  const login = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="flex flex-col items-left justify-left py-20 space-y-10">
        <div
          style={{ position: "relative", textAlign: "left", height: "500px" }}
        >
          <CircleGradients
            className="circle"
            style={{ position: "absolute", left: "-100px", top: "-200px" }}
          />
          <div
            style={{
              position: "absolute",
              top: "20%",
              marginLeft: "175px",
              color: "black", // Ensure this color contrasts with your SVG
              fontSize: "60px", // Adjust size as needed
              fontWeight: "bold",
            }}
          >
            <div style={{ fontWeight: "bold" }}>Study together.</div>
            <div style={{ fontWeight: "lighter" }}>
              {" "}
              {/* Adjust the font weight here */}
              Study smarter
            </div>
            <div className="space-x-4">
              <Button variant="default" onClick={login}>
                Start a Class
              </Button>
            </div>
          </div>
        </div>
        <div className="flex space-x-10 mx-40">
          <img
            src={inputTypesImage.src}
            alt="Input Types Images"
            style={{ float: "left", width: "50%", height: "auto", objectFit: "contain" }}
          />

         
        <div className="flex flex-col justify-center space-y-4">
            <h2 className="text-3xl font-bold text-left">
              Don&apos;t only take notes. Learn.
            </h2>
            <p className="text-left">
              You can add study notes as images, links, notes, videos, quotes,
              PDFs, articles, any study resource from the web, or your computer.
            </p>
            <p className="text-left">
              And don&apos;t forget,{" "}
              <a href="#" className="text-blue-500 underline">
                it&apos;s all collaborative!
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function LogInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
