export const levelTemplates = {
    1: {
        name: "Level1",
        terrain: {
            type: 'terrain',
            image: 'Village1.png', 
            width: 3600,
            height: 1400,
            x: 0,
            y: 0,
        },
        items: [
            { name: "Short Sword", location: {x: 55, y: 40 } }
        ],
        structures: [
            { name: "Home", location: {x: 10, y: 10, } }
        ],
        enemies: [
            { name: "Bob", location: {x: 175, y: 120 } }
        ],
        npcs: [
            { name: "Jackie", location: {x: 300, y: 100 } }
        ]
        
    }
}