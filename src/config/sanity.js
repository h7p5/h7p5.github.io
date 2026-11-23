// The original site loaded its gallery, studio and awards from a Sanity CMS.
// This copy has no CMS: the stub below makes the hooks in useSanityData.js
// skip fetching and use the hardcoded content in each room instead.
export const sanityClient = {
    config: () => ({ projectId: 'YOUR_PROJECT_ID' }),
    fetch: async () => null,
};

export const urlFor = () => null;

export const getProxyUrl = () => null;
