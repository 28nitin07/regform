/**
 * DMZ API utilities for managing user registrations
 * Handles adding and removing users from the DMZ database
 */

const DMZ_API_URL = process.env.DMZ_API_URL || 'https://dmz.agneepath.co.in/api/users';
const DMZ_API_KEY = process.env.DMZ_API_KEY || '';

interface DmzUser {
  email: string;
  name: string;
  university: string;
  phone: string;
}

interface DmzApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Add a user to the DMZ database
 * @param user User information to add
 * @returns Promise with success status
 */
export async function addUserToDmz(user: DmzUser): Promise<DmzApiResponse> {
  try {
    if (!DMZ_API_KEY) {
      console.error('[DMZ] API key not configured');
      return {
        success: false,
        error: 'DMZ API key not configured'
      };
    }

    const response = await fetch(DMZ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': DMZ_API_KEY
      },
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // 409 Conflict means user already exists - treat as success since DMZ state is correct
      if (response.status === 409) {
        console.log('[DMZ] User already exists (409):', user.email);
        return {
          success: true,
          message: 'User already exists in DMZ'
        };
      }
      
      console.error('[DMZ] Failed to add user:', response.status, errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`
      };
    }

    const data = await response.json();
    console.log('[DMZ] User added successfully:', user.email);
    return {
      success: true,
      message: data.message || 'User added successfully'
    };
  } catch (error) {
    console.error('[DMZ] Error adding user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Remove a user from the DMZ database
 * @param email Email of the user to remove
 * @returns Promise with success status
 */
export async function removeUserFromDmz(email: string): Promise<DmzApiResponse> {
  try {
    if (!DMZ_API_KEY) {
      console.error('[DMZ] API key not configured');
      return {
        success: false,
        error: 'DMZ API key not configured'
      };
    }

    const response = await fetch(DMZ_API_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': DMZ_API_KEY
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[DMZ] Failed to remove user:', response.status, errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`
      };
    }

    const data = await response.json();
    console.log('[DMZ] User removed successfully:', email);
    return {
      success: true,
      message: data.message || 'User removed successfully'
    };
  } catch (error) {
    console.error('[DMZ] Error removing user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Swap a user (remove old, add new)
 * Useful when changing email or university
 * @param oldEmail Email to remove
 * @param newUser New user data to add
 * @returns Promise with success status
 */
export async function swapUserInDmz(
  oldEmail: string,
  newUser: DmzUser
): Promise<DmzApiResponse> {
  // First try to remove the old user (if exists)
  const removeResult = await removeUserFromDmz(oldEmail);
  
  // Continue even if remove fails (user might not exist in DMZ)
  // The important part is ensuring the new user is added
  if (!removeResult.success) {
    console.log(`[DMZ] Old user "${oldEmail}" not found, proceeding to add new user`);
  }

  // Always add the new user regardless of remove result
  const addResult = await addUserToDmz(newUser);
  return addResult;
}

/**
 * Sync all players from a form submission to DMZ
 * @param formData Form data containing player information
 * @param university University name for all players
 * @returns Promise that resolves when all players are synced
 */
export async function syncFormPlayersToDmz(
  formData: {
    fields?: {
      playerFields?: Array<{
        name?: string;
        email?: string;
        phone?: string;
        [key: string]: unknown;
      }>;
    };
  },
  university: string
): Promise<void> {
  const players = formData.fields?.playerFields || [];
  
  if (players.length === 0) {
    console.log('[DMZ] No players to sync');
    return;
  }

  console.log(`[DMZ] Syncing ${players.length} players to DMZ`);

  // Sync all players in parallel (non-blocking)
  const syncPromises = players.map((player, index) => {
    if (!player.email || !player.name || !player.phone) {
      console.warn(`[DMZ] Skipping player ${index + 1} - missing required fields`);
      return Promise.resolve();
    }

    return addUserToDmz({
      email: player.email,
      name: player.name,
      university: university,
      phone: player.phone
    }).catch(err => {
      console.error(`[DMZ] Failed to sync player ${player.email}:`, err);
      // Don't throw - allow other players to continue syncing
    });
  });

  await Promise.allSettled(syncPromises);
  console.log(`[DMZ] Finished syncing ${players.length} players`);
}
