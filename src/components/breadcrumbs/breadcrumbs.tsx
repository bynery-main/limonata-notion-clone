import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Folder,
  FileText,
  BookOpen,
  Layout,
  HelpCircle,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

interface BreadcrumbItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}
interface BreadcrumbsProps {
  onBreadcrumbsUpdate?: (items: BreadcrumbItem[]) => void;
}
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ onBreadcrumbsUpdate }) => {
  const pathname = usePathname();
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    const fetchBreadcrumbs = async () => {
      const pathSegments = pathname!.split("/").filter((segment) => segment);
      let items: BreadcrumbItem[] = [];

      // console.log("Path Segments:", pathSegments);

      // Always start with Dashboard
      items.push({
        href: "/dashboard",
        label: "Dashboard",
        icon: <Home className="w-4 h-4 mr-1" />,
      });

      if (pathSegments.length > 1) {
        const workspaceId = pathSegments[1];
        const workspaceDoc = await getDoc(doc(db, "workspaces", workspaceId));
        const workspaceName = workspaceDoc.exists()
          ? workspaceDoc.data().name
          : "Workspace";
        // console.log("Workspace Name:", workspaceName);

        items.push({
          href: `/dashboard/${workspaceId}`,
          label: workspaceName,
          icon: <Folder className="w-4 h-4 mr-1" />,
        });

        if (pathSegments.length === 3) {
          // This is the folder case, when path is /dashboard/{workspaceId}/{folderId}
          const folderId = pathSegments[2];
          const folderDoc = await getDoc(
            doc(db, `workspaces/${workspaceId}/folders`, folderId)
          );
          const folderName = folderDoc.exists()
            ? folderDoc.data().name
            : "Folder";
          // console.log("Folder Name:", folderName);

          items.push({
            href: `/dashboard/${workspaceId}/${folderId}`,
            label: folderName,
            icon: <Folder className="w-4 h-4 mr-1" />,
          });
        } else if (pathSegments.length > 2) {
          let itemType = pathSegments[2];
          let icon, collection;

          switch (itemType) {
            case "quizzes":
              icon = <HelpCircle className="w-4 h-4 mr-1" />;
              collection = "quizSets";
              break;
            case "decks":
              icon = <Layout className="w-4 h-4 mr-1" />;
              collection = "flashcardsDecks";
              break;
            case "studyguides":
              icon = <BookOpen className="w-4 h-4 mr-1" />;
              collection = "studyGuides";
              break;
            default:
              icon = <Folder className="w-4 h-4 mr-1" />;
              collection = "folders";
              itemType = "folders";
          }

          items.push({
            href: `/dashboard/${workspaceId}/${itemType}`,
            label: itemType.charAt(0).toUpperCase() + itemType.slice(1),
            icon,
          });

          if (pathSegments.length > 3) {
            if (itemType !== "folders") {
              const itemId = pathSegments[3];
              const itemDoc = await getDoc(
                doc(db, `workspaces/${workspaceId}/${collection}`, itemId)
              );
              const itemName = itemDoc.exists() ? itemDoc.data().name : "Item";
              // console.log("Item Name:", itemName);
              

              items.push({
                href: `/dashboard/${workspaceId}/${itemType}/${itemId}`,
                label: itemName,
                icon,
              });
            }

            if (itemType === "folders" && pathSegments.length == 4) {
              const folderId = pathSegments[2];
              const noteId = pathSegments[3];
              const noteDoc = await getDoc(
                doc(
                  db,
                  `workspaces/${workspaceId}/folders/${folderId}/notes`,
                  noteId
                )
              );
              const noteName = noteDoc.exists() ? noteDoc.data().name : "Note";
              // console.log("Note Name:", noteName);

              items.push({
                href: `/dashboard/${workspaceId}/${itemType}/${folderId}/${noteId}`,
                label: noteName,
                icon: <FileText className="w-4 h-4 mr-1" />,
              });
            }
          }
        }
      }

      // console.log("Breadcrumb Items:", items);
      setBreadcrumbItems(items);
      if (onBreadcrumbsUpdate) {
        onBreadcrumbsUpdate(items);
      }
    };

    fetchBreadcrumbs();
  }, [pathname, onBreadcrumbsUpdate]);

  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex items-center flex-wrap text-sm">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index !== 0 && <span className="mx-2 text-gray-400">/</span>}
            {index === breadcrumbItems.length - 1 ? (
              <span className="flex items-center text-gray-700">
                {item.icon}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="flex items-center hover:text-[#FC608D] hover:underline"
              >
                {item.icon}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
