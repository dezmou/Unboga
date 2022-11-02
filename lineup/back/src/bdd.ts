import { readFile, writeFile } from "fs"

export const getItem = (id: string) => {
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

export const setItem = (id: string, data: string) => {
    return new Promise<void>((r, j) => {
        writeFile(`./bdd/${id}`, data, "utf-8", (err) => {
            if (err) {
                j(err)
            } else {
                r();
            }
        })
    })
}