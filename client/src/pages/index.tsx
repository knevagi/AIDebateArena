import {useState } from "react";
import Chat from "@/components/Chat";
import MobileSiderbar from "@/components/MobileSidebar";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
  };

  const toggleComponentVisibility = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  return (
    <main className="overflow-hidden w-full h-screen relative flex">
      {isComponentVisible ? (
        <MobileSiderbar 
          toggleComponentVisibility={toggleComponentVisibility}
        />
      ) : null}
      <div className="dark hidden flex-shrink-0 bg-gray-900 md:flex md:w-[260px] md:flex-col">
        <div className="flex h-full min-h-0 flex-col ">
          <Sidebar onTopicSelect={handleTopicSelect} />
        </div>
      </div>
      <Chat 
        toggleComponentVisibility={toggleComponentVisibility} 
        selectedTopic={selectedTopic}
      />
    </main>
  );
}
