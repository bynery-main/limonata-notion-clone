import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig.ts"; // Adjust the path if necessary
import CircleGradients from "./Circle-Gradients.svg";
import { SizeIcon } from "@radix-ui/react-icons";
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
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <LogInIcon className="h-6 w-6" />
          <span className="text-lg font-bold">
            Limonata <span className="font-light">Project</span>
          </span>
        </div>
        <div className="space-x-4">
          <Button variant="ghost" onClick={login}>
            LOG IN
          </Button>
          <Button variant="default" onClick={login}>
            SIGN UP
          </Button>
        </div>
      </header>
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
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <CardHeader>
                <Badge>Documents</Badge>
              </CardHeader>
              <CardContent>
                <p>Important PDF</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <Badge>Audio Transcriptions</Badge>
              </CardHeader>
              <CardContent>
                <p>Audio Wave</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <Badge>Photos of your handnotes</Badge>
              </CardHeader>
              <CardContent>
                <p>Image</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <Badge>Class Slides</Badge>
              </CardHeader>
              <CardContent>
                <p>"A bunch of class slides."</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <Badge>Relevant Articles and Papers</Badge>
              </CardHeader>
              <CardContent>
                <p>Article content</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <Badge>Videos of your class</Badge>
              </CardHeader>
              <CardContent>
                <p>Video content</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <Badge>Notion, Docs or Obsidian Notes</Badge>
              </CardHeader>
              <CardContent>
                <p>Notion, Google docs content</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <Badge>Youtube Videos</Badge>
              </CardHeader>
              <CardContent>
                <p>Design content</p>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Don't only take notes. Learn.
            </h2>
            <p>
              You can add study notes as images, links, notes, videos, quotes,
              PDFs, articles, any study resource from the web, or your computer.
            </p>
            <p>
              And don't forget,{" "}
              <a href="#" className="text-blue-500 underline">
                it's all collaborative!
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
