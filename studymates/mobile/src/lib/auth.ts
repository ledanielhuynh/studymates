import { supabase } from './supabaseClient';

function isAllowedDomain(email: string) {
	return /@unsw\.edu\.au$/i.test(email);
}

export async function signInWithEmail(email: string) {
	if (!isAllowedDomain(email)) {
		throw new Error('Only @unsw.edu.au emails are allowed');
	}
	const { data, error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
	if (error) throw error;
	return data;
}

export async function signOut() {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}