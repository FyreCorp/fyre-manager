export const defaultColor = 0x249fe6;
const dev = process.argv.includes('--dev');

export const productKeys = {
    [dev ? "18995f5c-cf3d-4800-ba41-021e2ec4298f" : ""]: 'user-license',
    [dev ? "4ae392e6-e3b5-4d73-ba3b-208c8aba67d2" : ""]: 'guild-license',
    [dev ? "6047b376-6c56-48ab-a1c6-5da5b8d79c3f" : ""]: 'custom-branding-1',
    [dev ? "59a17c78-9622-4a84-87ef-f33aa677f4c6" : ""]: 'custom-branding-2',
    [dev ? "0c9ab719-e750-4b5d-abc8-8bd241b542be" : ""]: 'custom-branding-3',
    [dev ? "5d0a6017-82bd-41ea-84e3-e7c2bc3c0539" : ""]: 'custom-branding-4',
    [dev ? "cd4721fb-a4b2-4a3e-ae01-72cb56346867" : ""]: 'custom-branding-5'
};
