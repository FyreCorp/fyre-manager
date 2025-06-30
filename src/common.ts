export const defaultColor = 0x249fe6;
const dev = process.argv.includes('--dev');

export const productKeys = {
    [dev ? "18995f5c-cf3d-4800-ba41-021e2ec4298f" : ""]: 'user-license',
    [dev ? "4ae392e6-e3b5-4d73-ba3b-208c8aba67d2" : ""]: 'guild-license'
};
