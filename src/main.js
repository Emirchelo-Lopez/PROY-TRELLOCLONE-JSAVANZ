const API_URL = "http://localhost:3000/cards";


async function fetchCards() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cards = response.json();
        renderCards(cards);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];        
    }
}

async function renderCards(cards) {
    const cards = await cards;
    const cardsContainer = document.querySelector(".cards-container");


}