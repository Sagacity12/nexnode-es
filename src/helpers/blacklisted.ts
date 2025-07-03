import client from '../servers/mongodb/redisConnectDB';

/**
 * add a token to the blacklist 
 * @param token - token to be blacklisted
 */
export const blacklistToken = async (token: string) => {
    await client.setEx(`blacklisted:${token}`, 60 * 60 * 24, 'true');
};

/**
 * check if a token is blacklisted
 * @param token - token to check
 * @returns {Promise<boolean>} - true if the token is blacklisted, false otherwise
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
    const result = await client.get(`blacklisted:${token}`);
    return result === 'true';
};

/**
 * Remove a token from the blacklist
 * @param token - token to be removed from the blacklist
 */
export const removeFromBlacklist = async (token: string) => {
    await client.del(`blacklisted:${token}`);
}