
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ContentItem {
    key: string;
    value: string;
    section: string;
    label: string;
}

export function useContent() {
    const [content, setContent] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let isMounted = true;

        async function fetchContent() {
            // Check if Supabase is configured
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                console.warn('Supabase not configured. Running in demo mode.');
                if (isMounted) {
                    setError(new Error('Supabase environment variables not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel environment variables and redeploy.'));
                    setLoading(false);
                }
                return;
            }

            try {
                // Set a timeout to prevent infinite loading
                timeoutId = setTimeout(() => {
                    if (isMounted && loading) {
                        setError(new Error('Request timed out. Please check your Supabase configuration.'));
                        setLoading(false);
                    }
                }, 10000); // 10 second timeout

                const { data, error: fetchError } = await supabase
                    .from('website_content')
                    .select('*');

                clearTimeout(timeoutId);

                if (!isMounted) return;

                if (fetchError) throw fetchError;

                const contentMap: Record<string, string> = {};
                data?.forEach((item: ContentItem) => {
                    contentMap[item.key] = item.value;
                });

                setContent(contentMap);
            } catch (err) {
                console.error('Error fetching content:', err);
                if (isMounted) {
                    setError(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchContent();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    const updateContent = async (key: string, value: string) => {
        try {
            const { error } = await supabase
                .from('website_content')
                .update({ value })
                .eq('key', key);

            if (error) throw error;

            setContent(prev => ({ ...prev, [key]: value }));
            return { success: true };
        } catch (err) {
            console.error('Error updating content:', err);
            return { success: false, error: err };
        }
    };

    return { content, loading, error, updateContent };
}
