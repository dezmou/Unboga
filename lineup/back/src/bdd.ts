import { readFile, writeFile, unlink } from "fs"

const cache: { [key: string]: Object } = {};

export const getItem = (id: string) => {
    if (cache[id]) return cache[id];
    return new Promise<string>((r, j) => {
        readFile(`./bdd/${id}`, "utf-8", (err, data) => {
            try {
                if (err) {
                    j(err)
                } else {
                    r(JSON.parse(data));
                }
            } catch (e) {
                j(e)
            }
        })
    })
}

export const deleteItem = async (id: string) => {
    await new Promise<void>((r, j) => {
        unlink(`./bdd/${id}`, (err) => {
            if (err) {
                j(err)
            } else {
                r();
            }
        })
    })
    delete cache[id]
}

export const setItem = async (id: string, data: Object) => {
    cache[id] = data;
    await new Promise<void>((r, j) => {
        try {
            writeFile(`./bdd/${id}`, JSON.stringify(data, null, 2), "utf-8", (err) => {
                if (err) {
                    j(err)
                } else {
                    r();
                }
            })
        } catch (e) {
            j(e)
        }
    })
}