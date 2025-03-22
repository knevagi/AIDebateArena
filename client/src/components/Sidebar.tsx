import React, { useState } from "react";
import {
  AiOutlineMessage,
  AiOutlinePlus,
  AiOutlineUser,
  AiOutlineSetting,
  AiFillCaretRight
} from "react-icons/ai";
import { BiLinkExternal } from "react-icons/bi";
import { FiMessageSquare } from "react-icons/fi";
import { MdLogout } from "react-icons/md";

interface SidebarProps {
  onTopicSelect?: (topic: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onTopicSelect }) => {
  const [topics] = useState([
    "Is artificial intelligence a threat to society?",
    "Should social media platforms be regulated to prevent misinformation?",
    "Should electric cars be prioritized over gasoline vehicles?",
    "Should all people have the right to own guns?",
    "Animal testing should be banned.",
    "Standardized testing should be abolished.",
    "Sexual education should be mandatory in schools.",
    "Sexual orientation is determined at birth.",
    "Are we living in a simulation, and what is the nature of reality?",
    "If God is all-powerful and all-good, why does evil exist?"
  ]);

  const handleTopicClick = (topic: string) => {
    if (onTopicSelect) {
      onTopicSelect(topic);
    }
  };

  return (
    <div className="scrollbar-trigger flex h-full w-full flex-1 items-start border border-blue-100 bg-blue-100">
      <nav className="flex h-full flex-1 flex-col space-y-1 p-2">
        <div className="flex-col flex-1 overflow-y-auto border-b border-blue-100">
          <div className="flex flex-col gap-2 pb-2 text-blue-900 text-sm">
            {topics.map((topic, index) => (
              <a
                key={index}
                onClick={() => handleTopicClick(topic)}
                className="flex py-3 px-3 items-center gap-3 relative rounded-md hover:bg-blue-50 cursor-pointer hover:pr-4 group"
              >
                <FiMessageSquare className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 text-ellipsis break-words relative whitespace-normal line-clamp-3">
                  {topic}
                </div>
              </a>
            ))}
          </div>
        </div>
        <label className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-blue-100 transition-colors duration-200 text-blue-900 cursor-pointer text-sm">
          <AiOutlinePlus className="h-4 w-4" />
          Configuration details
        </label>
        <label className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-blue-100 transition-colors duration-200 text-blue-900 cursor-pointer text-sm">
          <AiFillCaretRight className="h-4 w-4" />
          ChatGPT-3.5 Turbo
        </label>
        <label className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-blue-100 transition-colors duration-200 text-blue-900 cursor-pointer text-sm">
          <AiFillCaretRight className="h-4 w-4" />
          Claude-3.5 Sonnet
        </label>
        <label className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-blue-100 transition-colors duration-200 text-blue-900 cursor-pointer text-sm">
          <AiFillCaretRight className="h-4 w-4" />
          Gemini-1.5 Pro
        </label>
      </nav>
    </div>
  );
};

export default Sidebar;
