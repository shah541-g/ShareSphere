import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function SearchInput({ setInput, input, handleSearch }) {
  const [placeholder, setPlaceholder] = useState("Search people...");

  useEffect(() => {
    const updatePlaceholder = () => {
      if(window.innerWidth < 400)  {
        
        setPlaceholder("Search...");
      }else if (window.innerWidth < 640) {
       
        setPlaceholder("Search people  by name, username, bio, or location...");
      } 
      
      else if (window.innerWidth < 698) {
       
        setPlaceholder("Search people by name, username, bio...");
      }  else {
        
        setPlaceholder("Search people by name, username, bio, or location...");
      }
    };

    updatePlaceholder(); 
    window.addEventListener("resize", updatePlaceholder);
    return () => window.removeEventListener("resize", updatePlaceholder);
  }, []);

  return (
    <div className="relative">
      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 min-w-0 pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm"
        onChange={(e) => setInput(e.target.value)}
        value={input}
        onKeyUp={handleSearch}
      />
    </div>
  );
}
