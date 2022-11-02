import { readFile, writeFile } from "fs"

const cache: { [key: string]: string } = {};

export const getItem = (id: string) => {
    if (cache[id]) return cache[id];
    return new Promise<string>((r, j) => {
        readFile(`./bdd/${id}`, "utf-8", (err, data) => {
            if (err) {
                j(err)
            } else {
                r(data);
            }
        })
    })
}

export const setItem = async (id: string, data: string) => {
    cache[id] = data;
    await new Promise<void>((r, j) => {
        writeFile(`./bdd/${id}`, data, "utf-8", (err) => {
            if (err) {
                j(err)
            } else {
                r();
            }
        })
    })
}