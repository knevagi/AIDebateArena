import { SiOpenai,SiGooglegemini,SiClaude } from '@icons-pack/react-simple-icons';
import { HiUser } from "react-icons/hi";
import { TbCursorText } from "react-icons/tb";


interface MessageProps{
  message:{
    content:string;
    role:string;
    model?:string;
  };
  isTyping?:boolean;
  typingMessage?:string
}

const Message : React.FC<MessageProps> =({message, isTyping, typingMessage})=> {
  const { role, content: text,model } = message;

  const isUser = role === "user";

  return (
    <div
      className={`group w-full text-blue-800 border-b border-blue-100 ${
        isUser ? "bg-blue-50" : "bg-white"
      }`}
    >
      <div className="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl flex lg:px-0 m-auto w-full">
        <div className="flex flex-row gap-4 md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl p-4 md:py-6 lg:px-0 m-auto w-full">
          <div className="w-8 flex flex-col relative items-end">
            <div className="relative h-7 w-7 p-1 rounded-sm text-white flex items-center justify-center bg-blue-500 text-opacity-100r">
              {isUser ? (
                <HiUser className="h-4 w-4 text-white" />
              ) : (
                model=="ChatGPT"?
                <SiOpenai className="h-4 w-4 text-white" />
                :model=="Gemini"?
                <SiGooglegemini className="h-4 w-4 text-white" />
                :
                <SiClaude className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="text-xs flex items-center justify-center gap-1 absolute left-0 top-2 -ml-4 -translate-x-full group-hover:visible !invisible">
              <button
                disabled
                className="text-gray-300 dark:text-gray-400"
              ></button>
              <span className="flex-grow flex-shrink-0">1 / 1</span>
              <button
                disabled
                className="text-gray-300 dark:text-gray-400"
              ></button>
            </div>
          </div>
          <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
            <div className="flex flex-grow flex-col gap-3">
              <div className="min-h-20 flex flex-col items-start gap-4 whitespace-pre-wrap break-words">
                <div className="markdown prose w-full break-words text-blue-900">
                  {!isUser && text === null ? (
                    <TbCursorText className="h-6 w-6 animate-pulse text-blue-500" />
                  ) : isTyping ? (
                    <p>{typingMessage}<span className="animate-pulse">|</span></p>
                  ) : (
                    <p>{text}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
