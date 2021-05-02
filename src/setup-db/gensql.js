const movieList = [
  "Love & Other Drugs",
  "Plan 9 from Outer Space",
  "The Many Adventures of Winnie the Pooh",
  "Wild Wild West",
  "How the West Was Won",
  "The Adventures of Sharkboy and Lavagirl 3-D",
  "Quiz Show",
  "Punch-Drunk Love",
  "Journey to the West",
  "The Greatest Show on Earth",
  "Show People",
  "Dawn of the Dead",
  "I Love You Phillip Morris",
  "Office Space",
  "The Adventures of Priscilla, Queen of the Desert",
  "Pirates of the Caribbean: Dead Man\\'s Chest",
  "An American Tail: Fievel Goes West",
  "Star Wars: Episode IV - A New Hope",
  "Star Wars: Episode VI - Return of the Jedi",
  "Star Trek",
  "Star Wars: Episode II - Attack of the Clones",
  "Love Actually",
  "Lost in Space",
  "Dead Poets Society",
  "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb",
  "P.S. I Love You",
  "Muppets from Space",
  "Turks in Space",
  "The Adventures of Rocky & Bullwinkle",
  "The Rocky Horror Picture Show",
  "West Side Story",
  "Once Upon a Time in the West",
  "Slow West",
  "From Paris with Love",
  "2001: A Space Odyssey",
  "Star Trek II: The Wrath of Khan",
  "Shakespeare in Love",
  "The Extraordinary Adventures of Adèle Blanc-Sec",
  "A Million Ways to Die in the West",
  "Star Trek: First Contact",
  "West of Memphis",
  "Star Wars: Episode V - The Empire Strikes Back",
  "Star Trek Into Darkness",
  "Shaun of the Dead",
  "Zathura: A Space Adventure",
  "Space Chimps",
  "The Truman Show",
  "Red Rock West",
  "I Love You, Man",
  "Star Wars: Episode I - The Phantom Menace",
  "Space Cowboys",
  "The Adventures of Baron Munchausen",
  "Adventures in Babysitting",
  "The Adventures of Buckaroo Banzai Across the 8th Dimension",
  "Best in Show",
  "Show Me Love",
  "The Last Picture Show",
  "Show Boat",
  "The Adventures of Robin Hood",
  "There\\'s No Business Like Show Business",
  "From Russia with Love",
  "Star Wars: Episode III - Revenge of the Sith",
  "2001: A Space Travesty",
  "The Adventures of Tintin",
  "Dawn of the Planet of the Apes",
  "Diary of a Wimpy Kid",
  "False Trail",
  "All Quiet on the Western Front",
  "Sukiyaki Western Django",
  "Midnight Cowboy",
  "Alien",
  "The Kid",
  "The Big Trail",
  "Cowboy Bebop: The Movie",
  "Urban Cowboy",
  "Alien: Resurrection",
  "AVP: Alien vs. Predator",
  "Crossfire Trail",
  "All Quiet on the Western Front",
  "The Evil Dead",
  "Planet of the Apes",
  "Treasure Planet",
  "Alien Raiders",
  "Beneath the Planet of the Apes",
  "Alien Abduction",
  "The Kid",
  "HOUBA! On the Trail of the Marsupilami",
  "Western",
  "The Cowboy Way",
  "Alien³",
  "Planet Terror",
  "The Kid with a Bike",
  "Anacondas: Trail of Blood",
  "Total western",
  "Planet 51",
  "Honey I Blew Up the Kid",
  "Santa Fe Trail",
  "The Decline of Western Civilization",
  "Western Union",
  "Carry on Cowboy",
];

const shopList = [
  "a0f57009-820c-4a74-97e3-76cacf44d106",
  "0266df7b-d04e-408b-9996-b24761ed30a4",
  "1092131e-86a5-49d8-a85d-21ab57daf62c",
  "d65e1ad5-b45c-497d-88e7-9ca419042b7e",
  "3c9ba8e2-31a9-4ff0-a84e-b134c567a706",
  "ad6bda0f-8576-4b3e-8046-dd5088862d1a",
];

const fs = require("fs");
const uuid = require("uuid");

let i;
for (i = 0; i < movieList.length; i++) {
  const movie = movieList[i];
  const movieId = uuid.v4();
  const popularity = Math.floor(Math.random() * 10);
  const shopId = shopList[Math.floor(Math.random() * shopList.length) + 1];
  try {
    fs.appendFileSync('addMovies.sql', 'BEGIN;\n', function (err) {
        if (err) throw err;
    });
    fs.appendFileSync(
      "addMovies.sql",
      `INSERT INTO movies(movie_id, movie_name, popularity) VALUES('${movieId}', E'${movie}', ${popularity});\n`,
      function (err) {
        if (err) throw err;
      }
    );
    fs.appendFileSync(
      "addMovies.sql",
      `INSERT INTO shop_movie(shop_id, movie_id) VALUES('${shopId}', '${movieId}');\n`,
      function (err) {
        if (err) throw err;
      }
    );
    fs.appendFileSync('addMovies.sql', `COMMIT;\n`, function (err) {
        if (err) throw err;
    });
  } catch (err) {
    console.error(err);
  }
}
