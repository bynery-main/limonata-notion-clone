import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig"; // Adjust the path if necessary

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
          <span className="text-lg font-bold">my mind</span>
        </div>
        <div className="space-x-4">
          <Button variant="ghost" onClick={login}>
            LOG IN
          </Button>
          <Button variant="default">SIGN UP</Button>
        </div>
      </header>
      <main className="flex flex-col items-center justify-center py-20 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold">Study together. Study smarter.</h1>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-500 rounded-full blur-3xl opacity-50" />
            <div className="relative w-40 h-40 bg-white rounded-full" />
          </div>
        </div>
        <div className="flex space-x-10">
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
                <Badge>Products you like</Badge>
              </CardHeader>
              <CardContent>
                <p>Product image</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <Badge>Images that inspire you</Badge>
              </CardHeader>
              <CardContent>
                <p>Image</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <Badge>Quotes & Highlights</Badge>
              </CardHeader>
              <CardContent>
                <p>"A quote or highlight text."</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <Badge>Articles & Bookmarks</Badge>
              </CardHeader>
              <CardContent>
                <p>Article content</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <Badge>Video bookmarks</Badge>
              </CardHeader>
              <CardContent>
                <p>Video content</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <Badge>Private notes</Badge>
              </CardHeader>
              <CardContent>
                <p>Note content</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <Badge>Design inspiration</Badge>
              </CardHeader>
              <CardContent>
                <p>Design content</p>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Don't only take notes. Learn.</h2>
            <p>
              You can add study notes as images, links, notes, videos, quotes, PDFs, articles, any study resource from
              the web, or your computer.
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

function LogInIcon(props) {
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

function XIcon(props) {
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
