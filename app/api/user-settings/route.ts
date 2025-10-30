import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet_address');

    // Build query
    let query = supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', userId);

    if (walletAddress) {
      query = query.eq('wallet_address', walletAddress);
    }

    const { data: settings, error } = await query.maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    // Return default settings if none exist
    return NextResponse.json({
      success: true,
      settings: settings || {
        user_id: userId,
        wallet_address: walletAddress,
        tutorial_dismissed: false,
        preferences: {}
      }
    });

  } catch (error: any) {
    console.error('User settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { wallet_address, tutorial_dismissed, preferences } = body;

    // Upsert user settings
    const { data: settings, error } = await supabaseAdmin
      .from('user_settings')
      .upsert({
        user_id: userId,
        wallet_address: wallet_address || null,
        tutorial_dismissed: tutorial_dismissed !== undefined ? tutorial_dismissed : false,
        preferences: preferences || {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,wallet_address',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving user settings:', error);
      return NextResponse.json(
        { error: 'Failed to save settings', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error: any) {
    console.error('User settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { wallet_address, tutorial_dismissed, preferences } = body;

    // Build update query
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (tutorial_dismissed !== undefined) {
      updateData.tutorial_dismissed = tutorial_dismissed;
    }

    if (preferences !== undefined) {
      updateData.preferences = preferences;
    }

    if (wallet_address !== undefined) {
      updateData.wallet_address = wallet_address;
    }

    // Build query with filters
    let query = supabaseAdmin
      .from('user_settings')
      .update(updateData)
      .eq('user_id', userId);

    if (wallet_address) {
      query = query.eq('wallet_address', wallet_address);
    }

    const { data: settings, error } = await query.select().maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error updating user settings:', error);
      return NextResponse.json(
        { error: 'Failed to update settings', details: error.message },
        { status: 500 }
      );
    }

    // If no settings exist, create them
    if (!settings) {
      const { data: newSettings, error: createError } = await supabaseAdmin
        .from('user_settings')
        .insert({
          user_id: userId,
          wallet_address: wallet_address || null,
          tutorial_dismissed: tutorial_dismissed || false,
          preferences: preferences || {}
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create settings', details: createError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        settings: newSettings
      });
    }

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error: any) {
    console.error('User settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

