import { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { BsChevronDown, BsPlusLg } from "react-icons/bs";
import { RxHamburgerMenu } from "react-icons/rx";

import Message from "./Message";
import Sidebar from "./Sidebar";

interface ChatProps {
  toggleComponentVisibility: () => void;
  selectedTopic: string;
}

const Chat: React.FC<ChatProps> = ({ toggleComponentVisibility, selectedTopic }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showEmptyChat, setShowEmptyChat] = useState(true);
  const [conversation, setConversation] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [isTopicSelected, setIsTopicSelected] = useState(false);
  const [debateRounds, setDebateRounds] = useState(3);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const bottomOfChatRef = useRef<HTMLDivElement>(null);
  
  // Define available models
  const AVAILABLE_MODELS = [
    { name: "ChatGPT", id: "gpt-3.5-turbo", available: true },
    { name: "Gemini", id: "gemini-1.5-pro", available: true },
    { name: "Claude", id: "claude-3-5-sonnet-20240620", available: true }
  ];

  // State for both debators
  const [debator1Model, setDebator1Model] = useState(AVAILABLE_MODELS[0]);
  const [debator2Model, setDebator2Model] = useState(AVAILABLE_MODELS[1]);
  const [isDropdown1Open, setIsDropdown1Open] = useState(false);
  const [isDropdown2Open, setIsDropdown2Open] = useState(false);
  const [loadingClaude, setLoadingClaude] = useState(false);
  const [loadingOpenAI, setLoadingOpenAI] = useState(false);
  const [isConstructingDebate, setIsConstructingDebate] = useState(false);
  const [typingMessage, setTypingMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);

  // Add effect to handle selected topic
  useEffect(() => {
    if (selectedTopic) {
      setMessage(selectedTopic);
      setIsTopicSelected(true);
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "24px";
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
      }
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "24px";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [message, textAreaRef]);

  useEffect(() => {
    if (bottomOfChatRef.current) {
      bottomOfChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const sendMessage = async (e: any) => {
    e.preventDefault();
    setMessage("");

    if (message.length < 1) {
      setErrorMessage("Please enter a message.");
      return;
    }
    
    setErrorMessage("");
    setIsConstructingDebate(true);

    const userMessage = { content: message, role: "user" };
    setShowEmptyChat(false);

    const bodyparam = JSON.stringify({
      messages: [
        ...conversation.map(msg => ({ role: msg.role, content: msg.content })),
        userMessage
      ].filter(msg => msg.content !== null),
      model1: debator1Model.name,
      model2:debator2Model.name,
      rounds:debateRounds.toString()
    });

    setConversation(prev => [...prev, userMessage]);

    try {
      const response = await fetch(`http://172.19.96.1:8000/send_answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: bodyparam,
      });

      if (response.ok) {
        const data = await response.json();
        setIsConstructingDebate(false);
        console.log(data);
        
        // Process responses one by one
        for (const res of data) {
          // Add Model1Res with typing animation
          setTypingMessage(debator1Model.name+" is typing...");
          setIsTyping(true);
          await new Promise(resolve => setTimeout(resolve, 10000)); // Simulate typing delay
          setConversation(prev => [...prev, { content: res.Model1Res, role: "system" }]);
          setIsTyping(false);
          
          // Add Model2Res with typing animation
          setTypingMessage(debator1Model.name+" is typing...");
          setIsTyping(true);
          await new Promise(resolve => setTimeout(resolve, 10000)); // Simulate typing delay
          setConversation(prev => [...prev, { content: res.Model2Res, role: "system" }]);
          setIsTyping(false);
        }
      } else {
        console.error(response);
        setErrorMessage(response.statusText);
        setIsConstructingDebate(false);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message);
      setIsConstructingDebate(false);
    }
  };

  const handleKeypress = (e: any) => {
    // It's triggers by pressing the enter key
    if (e.keyCode == 13 && !e.shiftKey) {
      sendMessage(e);
      e.preventDefault();
    }
  };

  // Handle model selection
  const handleDebator1Select = (model: any) => {
    setDebator1Model(model);
    setIsDropdown1Open(false);
  };

  const handleDebator2Select = (model: any) => {
    setDebator2Model(model);
    setIsDropdown2Open(false);
  };

  const handleRoundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 10) {
      setDebateRounds(value);
    }
  };

  // Get available models for each dropdown
  const getAvailableModelsForDebator1 = () => {
    return AVAILABLE_MODELS.filter(model => model.id !== debator2Model.id);
  };

  const getAvailableModelsForDebator2 = () => {
    return AVAILABLE_MODELS.filter(model => model.id !== debator1Model.id);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTopicSelected(false);
  };

  return (
                <div className="flex max-w-full flex-1 flex-col">
                <div className="sticky top-0 z-10 flex items-center border-b border-blue-100 bg-blue-50 pl-1 pt-1 text-blue-900 sm:pl-3 md:hidden">
                  <button
                    type="button"
                    className="-ml-0.5 -mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:hover:text-white"
                    onClick={toggleComponentVisibility}
                  >
                    <span className="sr-only">Open sidebar</span>
                    <RxHamburgerMenu className="h-6 w-6 text-white" />
                  </button>
                  <h1 className="flex-1 text-center text-base font-normal">New chat</h1>
                  <button type="button" className="px-3">
                    <BsPlusLg className="h-6 w-6" />
                  </button>
                </div>
                <div className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
                  <div className="flex-1 overflow-hidden">
                    <div className="react-scroll-to-bottom--css-ikyem-79elbk h-full bg-white">
                      <div className="react-scroll-to-bottom--css-ikyem-1n7m0yu">
                        {!showEmptyChat && conversation.length > 0 ? (
                          <div className="flex flex-col items-center text-sm bg-gray-800">
                            <div className="flex w-full items-center justify-center gap-1 border-b border-blue-100 bg-blue-50 p-3 text-blue-700">
                              Model: {debator1Model.name} vs {debator2Model.name}
                            </div>
                            {conversation.map((message, index) => (
                              <Message 
                                key={index} 
                                message={message} 
                                isTyping={false}
                              />
                            ))}
                            {isConstructingDebate && (
                              <div className="flex items-center justify-center p-4 bg-sky-500 text-white w-full">
                                <div className="animate-pulse">Constructing Debate...</div>
                              </div>
                            )}
                            {isTyping && (
                              <Message 
                                message={{ role: 'system', content: '' }}
                                isTyping={true}
                                typingMessage={typingMessage}
                              />
                            )}
                            <div className="w-full h-32 md:h-48 flex-shrink-0 bg-white"></div>
                            <div ref={bottomOfChatRef}></div>
                          </div>
                        ) : null}
                        {showEmptyChat ? (
                          <div className="py-10 relative w-full flex flex-col h-full">
                            <div className="flex flex-col items-center gap-4">
                              <div className="flex items-center justify-center gap-2">
                                <div className="relative w-full md:w-3/4 lg:w-2/3 xl:w-1/2">
                                  <button
                                    onClick={() => setIsDropdown1Open(!isDropdown1Open)}
                                    className="relative flex w-full cursor-pointer flex-col rounded-md border border-blue-200 bg-white py-2 pl-3 pr-10 text-left focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    id="headlessui-listbox-button-:r0:"
                                    type="button"
                                    aria-haspopup="true"
                                    aria-expanded={isDropdown1Open}
                                  >
                                    <label className="block text-xs text-blue-600 text-center">
                                      Model Debator 1 (For)
                                    </label>
                                    <span className="inline-flex w-full truncate">
                                      <span className="flex h-6 items-center gap-1 truncate text-blue-900">
                                        {debator1Model.name}
                                      </span>
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                      <BsChevronDown className="h-4 w-4 text-gray-400" />
                                    </span>
                                  </button>
                                  {isDropdown1Open && (
                                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                      <ul className="max-h-60 overflow-auto py-1">
                                        {getAvailableModelsForDebator1().map((model) => (
                                          <li
                                            key={model.id}
                                            onClick={() => handleDebator1Select(model)}
                                            className="cursor-pointer px-4 py-2 hover:bg-blue-50 text-blue-900"
                                          >
                                            {model.name}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-center px-4">
                                  <span className="text-lg font-bold text-blue-600">VS</span>
                                </div>
                                <div className="relative w-full md:w-3/4 lg:w-2/3 xl:w-1/2">
                                  <button
                                    onClick={() => setIsDropdown2Open(!isDropdown2Open)}
                                    className="relative flex w-full cursor-pointer flex-col rounded-md border border-blue-200 bg-white py-2 pl-3 pr-10 text-left focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    id="headlessui-listbox-button-:r2:"
                                    type="button"
                                    aria-haspopup="true"
                                    aria-expanded={isDropdown2Open}
                                  >
                                    <label className="block text-xs text-blue-600 text-center">
                                      Model Debator 2(Against)
                                    </label>
                                    <span className="inline-flex w-full truncate">
                                      <span className="flex h-6 items-center gap-1 truncate text-blue-900">
                                        {debator2Model.name}
                                      </span>
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                      <BsChevronDown className="h-4 w-4 text-gray-400" />
                                    </span>
                                  </button>
                                  {isDropdown2Open && (
                                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                      <ul className="max-h-60 overflow-auto py-1">
                                        {getAvailableModelsForDebator2().map((model) => (
                                          <li
                                            key={model.id}
                                            onClick={() => handleDebator2Select(model)}
                                            className="cursor-pointer px-4 py-2 hover:bg-blue-50 text-blue-900"
                                          >
                                            {model.name}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-4">
                                <label className="text-sm text-blue-600">Debate Rounds:</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={debateRounds}
                                  onChange={handleRoundsChange}
                                  className="w-24 px-3 py-2 border border-blue-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 text-blue-900"
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}
                        <div className="flex flex-col items-center text-sm dark:bg-gray-800"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full border-t border-blue-100 bg-white pt-2">
                    <form className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
                      <div className="relative flex flex-col h-full flex-1 items-stretch md:flex-col">
                        {errorMessage ? (
                          <div className="mb-2 md:mb-0">
                            <div className="h-full flex ml-1 md:w-full md:m-auto md:mb-2 gap-0 md:gap-2 justify-center">
                              <span className="text-red-500 text-sm">{errorMessage}</span>
                            </div>
                          </div>
                        ) : null}
                        <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-blue-200 bg-white text-blue-900 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)]">
                          <textarea
                            ref={textAreaRef}
                            value={message}
                            tabIndex={0}
                            data-id="root"
                            style={{
                              height: "24px",
                              maxHeight: "200px",
                              overflowY: "hidden",
                            }}
                            disabled={isTopicSelected}
                            placeholder="Pick a topic"
                            className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 bg-transparent pl-2 md:pl-0 text-blue-900 placeholder-blue-400"
                            onChange={handleMessageChange}
                            onKeyDown={handleKeypress}
                          ></textarea>
                          <button
                            disabled={isLoading || message?.length === 0}
                            onClick={sendMessage}
                            className="absolute p-1 rounded-md bottom-1.5 md:bottom-2.5 bg-transparent disabled:bg-blue-200 right-1 md:right-2 disabled:opacity-40"
                          >
                            <FiSend className="h-4 w-4 mr-1 text-blue-600" />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
  );
};

export default Chat;
