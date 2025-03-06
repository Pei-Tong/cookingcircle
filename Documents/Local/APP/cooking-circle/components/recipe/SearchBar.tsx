import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  placeholder: string
  onSearch: (query: string) => void
}

export function SearchBar({ placeholder, onSearch }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Input
        type="search"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-12 py-3 pr-4 text-base rounded-md border-gray-200 bg-white focus:border-gray-300 focus:ring-0"
      />
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    </div>
  )
}

