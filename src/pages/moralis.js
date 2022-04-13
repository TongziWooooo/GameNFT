Moralis.Cloud.define("HelloWorld", async(request) => {
    return "hello,world!";
});

class Hero {
    constructor(name, attack, armor, speed, luck, hp, randNum) {
        this.name = name;
        this.attack = attack;
        this.armor = armor;
        this.speed = speed;
        this.luck = luck;
        this.max_hp = hp;
        this.cur_hp = hp;
        this.randonNum = randNum;
    }

    action(target) {
        let damage = 0;
        let message;
        if (target.dodge()) {
            message = target + " dodges " + this.name + "'s attack!";
        } else if (this.randomResult(this.luck)) {
            damage = this.criticalAttack(target);
            message = target + " critically attacks " + this.name + ", damage = " + damage;
        } else {
            damage = this.attackTarget(target);
            message = target + " attacks " + this.name + ", damage = " + damage;
        }
        target.cur_hp -= damage;
        return message;
    }

    attackTarget(target) {
        let damage = 0;
        if (this.attack - target.armor > this.attack / 2){
            damage = this.attack - target.getArmor();
        }
        else{
            damage = this.attack / 2;
        }
        return damage;
    }

    criticalAttack(){
        let damage = this.attack * 1.5;
        return damage;
    }

    dodge(){
        return this.randomResult(this.getSpeed());
    }

    randomResult(prob){
        let max = 100;
        let tmp = this.randonNum.randomSin();
        return Math.sin(prob / max * Math.PI / 2) >= tmp;
    }

    isAlive(){
        return this.cur_hp >= 0;
    }

    toString(){
        return this.name;
    }

    getArmor(){
        return this.armor;
    }

    getSpeed(){
        return this.speed;
    }
}

class Battle{
    constructor(hero1, hero2) {
        if(hero1.getSpeed() >= hero2.getSpeed()){
            this.player1 = hero1;
            this.player2 = hero2;
        }
        else{
            this.player1 = hero2;
            this.player2 = hero1;
        }
        this.battleRecord = [];
    }

    fight(){
        let actionList = [];
        actionList.push(this.player1);
        actionList.push(this.player2);
        while(this.player1.isAlive() && this.player2.isAlive()){
            let curPlayer = actionList.shift();
            let target = actionList[0];
            let msg = curPlayer.action(target);
            actionList.push(curPlayer);
            this.battleRecord.push(msg);
        }
        let res;
        if(this.player1.isAlive())
            res = 1 // Win
        else
            res = 0 // Lose
        return [this.battleRecord, res];
    }
}

class seedRandom{
    constructor(seed) {
        this.iter = 1;
        this.seed = seed;
    }

    randomInt(max){
        let res = Math.floor(Math.abs(Math.sin(this.seed * this.iter)) * max);
        this.iter ++;
        return res;
    }

    randomSin(){
        let res = Math.abs(Math.sin(this.seed * this.iter));
        this.iter ++;
        return res;
    }
}

Moralis.Cloud.define("battle", async(request) => {
    let seed = request.params.seed;
    let heroInfo1 = request.params.heroInfo1;
    let heroInfo2 = request.params.heroInfo2;

    let randNum = new seedRandom(seed);
    let hero1 = new Hero(heroInfo1.name,
        heroInfo1.attack, heroInfo1.armor, heroInfo1.speed, heroInfo1.luck, heroInfo1.hp, randNum);
    let hero2 = new Hero(heroInfo2.name,
        heroInfo2.attack, heroInfo2.armor, heroInfo2.speed, heroInfo2.luck, heroInfo2.hp, randNum);

    let battle = new Battle(hero1, hero2);
    return battle.fight();
});