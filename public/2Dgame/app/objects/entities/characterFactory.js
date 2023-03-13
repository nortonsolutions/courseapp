// This module is to build the base character with basic stats

export class CharacterBase{

    constructor(){
        this.firstName=firstMame;
        this.lastName=lastName;
        this.strength=strength;
        this.dexterity= dexterity;
        this.constitution = constitution;
        this.inteligence = inteligence;
        this.wisdom= wisdom;
        this.charisma = charisma;
        this.hitPoints = hitPoints;
        this.mana = mana;
        this.speed = speed;
        this.saves={fortitude:"",reflex:"",will:""};
        this.baseAttack=baseAttack;

    }
}