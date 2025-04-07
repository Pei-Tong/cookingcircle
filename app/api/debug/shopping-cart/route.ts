import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // Check for table information using system tables
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'shopping_cart' });
    
    if (tableError) {
      console.error("Error fetching table info:", tableError);
      
      // Fallback to selecting a single row
      const { data, error } = await supabase
        .from('shopping_cart')
        .select('*')
        .limit(1);
      
      if (error) {
        return NextResponse.json({
          error: 'Error fetching table data',
          details: error,
          message: 'Could not retrieve shopping_cart table information'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        message: 'Retrieved sample data from shopping_cart',
        sampleData: data
      });
    }
    
    return NextResponse.json({
      message: 'Retrieved table information',
      tableInfo
    });
  } catch (error) {
    console.error("Error in shopping-cart debug route:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 