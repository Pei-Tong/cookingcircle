import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    // Check shopping_cart table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('shopping_cart')
      .select('*')
      .limit(1);
    
    // Get ingredients
    const { data: ingredientsData, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('*')
      .limit(3);
    
    // Get products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(3);
    
    return NextResponse.json({
      cart: {
        data: tableInfo,
        error: tableError
      },
      ingredients: {
        data: ingredientsData,
        error: ingredientsError
      },
      products: {
        data: productsData,
        error: productsError
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 