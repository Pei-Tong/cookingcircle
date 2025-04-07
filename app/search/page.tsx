import { Suspense } from "react"
import SearchPageContent from "./SearchPageContent"

export const dynamic = "force-dynamic"

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading search results...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
