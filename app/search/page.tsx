"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

// 🔹 Recipe 데이터 타입 정의
interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  ingredients: string[];
  likes: number;
  views: number;
}

// 🔹 더미 데이터 (필요한 속성 추가)
const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Homemade Margherita Pizza",
    description: "Classic Italian pizza with fresh mozzarella, tomatoes, and basil",
    image: "/Food_Image/Margherita_Pizza.webp",
    tags: ["Italian", "Vegetarian"],
    ingredients: ["Tomato", "Mozzarella", "Basil", "Olive Oil", "Flour"],
    likes: 128,
    views: 1024,
  },
  {
    id: "2",
    title: "Avocado Toast with Poached Eggs",
    description: "Healthy breakfast option.",
    image: "/Food_Image/Avocado_Toast_with_eggs.jpeg",
    tags: ["Breakfast", "Healthy"],
    ingredients: ["Avocado", "Egg", "Bread", "Salt", "Pepper"],
    likes: 95,
    views: 876,
  },
  {
    id: "3",
    title: "Thai Green Curry",
    description: "Aromatic and spicy Thai curry with vegetables and coconut milk.",
    image: "/Food_Image/Thai_green_curry.jpg",
    tags: ["Thai", "Spicy"],
    ingredients: ["Coconut Milk", "Green Curry Paste", "Chicken", "Basil", "Lime"],
    likes: 156,
    views: 1432,
  },
  {
    id: "4",
    title: "Chocolate Chip Cookies",
    image: "/Food_Image/Chocolate_chip_cookies.jpg",
    description: "Classic homemade cookies with gooey chocolate chips",
    tags: ["Dessert", "Baking"],
    ingredients: ["Flour", "Butter", "Sugar", "Brown Sugar", "Eggs", "Vanilla Extract", "Baking Soda", "Salt", "Chocolate Chips"],
    likes: 210,
    views: 1876,
  },
  {
    id: "5",
    title: "Korean Bibimbap",
    image: "/Food_Image/Korean_bibimbap.jpeg",
    description: "Colorful rice bowl with vegetables, meat, and spicy gochujang sauce",
    tags: ["Korean", "Spicy"],
    ingredients: ["Rice", "Beef", "Carrot", "Spinach", "Egg", "Gochujang", "Sesame Oil", "Soy Sauce"],
    likes: 178,
    views: 1532,
  },
  {
    id: "6",
    title: "Vegan Mushroom Risotto",
    image: "/Food_Image/Vegan_mushroom_risotto.jpg",
    description: "Creamy Italian rice dish with mushrooms and herbs",
    tags: ["Italian", "Vegan"],
    ingredients: ["Arborio Rice", "Mushrooms", "Vegetable Broth", "Garlic", "Onion", "Olive Oil", "Nutritional Yeast"],
    likes: 87,
    views: 943,
  },
  {
    id: "7",
    title: "Beef Wellington",
    image: "/Food_Image/Beef_wellington.avif",
    description: "Tender beef fillet wrapped in puff pastry with mushroom duxelles",
    tags: ["British", "Special Occasion"],
    ingredients: ["Beef Fillet", "Puff Pastry", "Mushrooms", "Dijon Mustard", "Egg Yolk", "Prosciutto", "Thyme"],
    likes: 132,
    views: 1245,
  },
  {
    id: "8",
    title: "Lemon Blueberry Pancakes",
    image: "/Food_Image/Blueberry_pancakes.jpg",
    description: "Fluffy pancakes with fresh blueberries and lemon zest",
    tags: ["Breakfast", "Sweet"],
    ingredients: ["Flour", "Blueberries", "Milk", "Eggs", "Baking Powder", "Sugar", "Lemon Zest", "Butter"],
    likes: 104,
    views: 987,
  },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (query) {
      // 🔹 검색어를 쉼표(,)로 구분하여 배열로 변환 (공백 제거)
      const queryKeywords = query.toLowerCase().split(/[,\s]+/).map(q => q.trim());

      const results = mockRecipes
        .map((recipe) => ({
          recipe,
          matchCount: queryKeywords.filter(q =>
            recipe.title.toLowerCase().includes(q) || // ✅ 제목 검색 추가
            recipe.tags.some(tag => tag.toLowerCase().includes(q) || q.includes(tag.toLowerCase()) || tag.toLowerCase().includes(q)) || // ✅ 태그 검색 개선
            recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(q)) // ✅ 재료 검색 유지
          ).length, // 🔹 일치하는 개수 계산
        }))
        .filter(({ matchCount }) => matchCount > 0) // 🔹 하나라도 포함된 경우 유지
        .sort((a, b) => b.matchCount - a.matchCount) // 🔹 일치 개수 기준 정렬
        .map(({ recipe }) => recipe);

      setFilteredRecipes(results);
    } else {
      setFilteredRecipes([]); // 🔹 검색어 없을 경우 초기화
    }
  }, [query]); // ✅ `query`가 변경될 때마다 실행

  return (
    <main className="min-h-screen flex flex-col">
      {/* ✅ 네비게이션 추가 */}
      <Navigation />

      {/* ✅ 검색 결과 */}
      <div className="flex-grow p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold">Search Results for: "{query}"</h1>
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} {...recipe} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-500">No recipes found.</p>
        )}
      </div>

      {/* ✅ 푸터 추가 */}
      <Footer />
    </main>
  );
}
