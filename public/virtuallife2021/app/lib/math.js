function randomChance() {
    return chance(getRndInteger(0,100));
}

function chance(percentage) {
    return (Math.floor((Math.random() * 100) + 1) <= percentage);

}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

export { randomChance, chance, getRndInteger };