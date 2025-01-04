export const getValue = (keyName: string, defaultValue: any) => {
    try {
        const value = window.localStorage.getItem(keyName)
        if (value) {
            return JSON.parse(value)
        } else {
            return defaultValue
        }
    } catch (err) {
        return defaultValue
    }
}

export const setValue = (keyName: string, newValue: any) => {
    try {
        window.localStorage.setItem(keyName, JSON.stringify(newValue))
    } catch (err) {
        console.log(err)
    }
}

export const setUser = (value: string | undefined) => {
    setValue("userLocal", value)
}

export const getUser = () => {
    return getValue("userLocal", undefined)
}

export const toggleFavourite = (id: string) => {
    const list = getValue("favourites", [])

    if (list.includes(id)) {
        list.splice(list.indexOf(id), 1)
    } else {
        list.push(id)
    }

    setValue("favourites", list)
    window.dispatchEvent(new Event("storage"))
}

export const getFavourites = () => {
    return getValue("favourites", [])
}

