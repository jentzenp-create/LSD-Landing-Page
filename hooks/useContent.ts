
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
        async function fetchContent() {
            try {
                const { data, error } = await supabase
                    .from('website_content')
                    .select('*');

                if (error) throw error;

                const contentMap: Record<string, string> = {};
                data?.forEach((item: ContentItem) => {
                    contentMap[item.key] = item.value;
                });

                setContent(contentMap);
            } catch (err) {
                console.error('Error fetching content:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchContent();
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
