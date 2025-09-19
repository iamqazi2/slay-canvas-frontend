"use client";
import { useState, useEffect } from "react";
import {
  AudioPlayer,
  ChatInterfaceDraggable,
  ImageCollection,
  PdfDocument,
  Sidebar,
  VideoCollection,
  WikipediaLink,
} from "../components";
import ChatNav from "../components/New-Navbar";

interface ComponentInstance {
  id: string;
  type: string;
  data?: { file?: File; text?: string };
}

export default function Home() {
  const [componentInstances, setComponentInstances] = useState<
    ComponentInstance[]
  >([{ id: "video-collection-1", type: "videoCollection" }]);

  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Listen for component creation events
  useEffect(() => {
    const handleCreateComponent = (event: CustomEvent) => {
      const { componentType, data } = event.detail;
      const newInstance: ComponentInstance = {
        id: `${componentType}-${Date.now()}`,
        type: componentType,
        data: data,
      };

      setComponentInstances((prev) => [...prev, newInstance]);
    };

    const handleRemoveComponent = (event: CustomEvent) => {
      const { componentId } = event.detail;
      console.log(
        "handleRemoveComponent called with componentId:",
        componentId
      );
      setComponentInstances((prev) => {
        console.log("Current component instances before filter:", prev);
        const filtered = prev.filter((instance) => instance.id !== componentId);
        console.log("Filtered component instances:", filtered);
        return filtered;
      });
    };

    window.addEventListener(
      "createComponent",
      handleCreateComponent as EventListener
    );
    window.addEventListener(
      "removeComponent",
      handleRemoveComponent as EventListener
    );

    return () => {
      window.removeEventListener(
        "createComponent",
        handleCreateComponent as EventListener
      );
      window.removeEventListener(
        "removeComponent",
        handleRemoveComponent as EventListener
      );
    };
  }, []);

  const renderComponent = (instance: ComponentInstance) => {
    const { id, type, data } = instance;

    switch (type) {
      case "videoCollection":
        return <VideoCollection key={id} id={id} />;
      case "audioPlayer":
        return (
          <AudioPlayer
            key={id}
            id={id}
            initialData={data?.file ? { file: data.file } : undefined}
          />
        );
      case "imageCollection":
        return (
          <ImageCollection
            key={id}
            id={id}
            initialData={data?.file ? { file: data.file } : undefined}
          />
        );
      case "pdfDocument":
        return (
          <PdfDocument
            key={id}
            id={id}
            initialData={data?.file ? { file: data.file } : undefined}
          />
        );
      case "wikipediaLink":
        return (
          <WikipediaLink
            key={id}
            id={id}
            initialData={data?.text ? { text: data.text } : undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="">
      <div className="relative">
        <ChatNav />
        <Sidebar onChatClick={() => setIsChatOpen(true)} />
        {/* <LetsGetStarted /> */}
        <div className="relative w-full h-full overflow-hidden">
          {componentInstances.map(renderComponent)}
        </div>
        {isChatOpen && <ChatInterfaceDraggable />}
      </div>
    </div>
  );
}
