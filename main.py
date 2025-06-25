from models import GameData
import json

def print_animal(animal):
    print(f"\n{animal.name.upper()}")
    print(f"Type: {animal.type}")
    print(f"Habitat: {animal.habitat}")
    print(f"Description: {animal.description}")
    print(f"Fun Fact: {animal.fun_fact}")
    print(f"Attributes: {', '.join(animal.attributes)}")
    if animal.awards:
        print(f"Awards: {', '.join(animal.awards)}")

def main():
    # Initialize game data
    print("Loading game data...")
    game_data = GameData()
    game_data.load_data()
    
    print(f"\nWelcome to Cosmic Animal Awards!")
    print(f"Loaded {len(game_data.animals)} animals and {len(game_data.awards)} awards.")
    
    while True:
        print("\n--- MAIN MENU ---")
        print("1. View all animals")
        print("2. View Earth animals")
        print("3. View Alien animals")
        print("4. Battle two animals")
        print("5. View awards")
        print("6. Exit")
        
        choice = input("\nEnter your choice (1-6): ")
        
        if choice == '1':
            print("\n--- ALL ANIMALS ---")
            for idx, animal_id in enumerate(sorted(game_data.animals.keys()), 1):
                animal = game_data.animals[animal_id]
                print(f"{idx}. {animal.name} ({animal.type})")
            
            animal_choice = input("\nEnter animal number to view details (or press Enter to go back): ")
            if animal_choice.isdigit():
                animal_id = sorted(game_data.animals.keys())[int(animal_choice)-1]
                print_animal(game_data.animals[animal_id])
        
        elif choice == '2':
            print("\n--- EARTH ANIMALS ---")
            earth_animals = game_data.get_animals_by_type('earth')
            for idx, animal in enumerate(earth_animals, 1):
                print(f"{idx}. {animal.name}")
        
        elif choice == '3':
            print("\n--- ALIEN ANIMALS ---")
            alien_animals = game_data.get_animals_by_type('alien')
            for idx, animal in enumerate(alien_animals, 1):
                print(f"{idx}. {animal.name}")
        
        elif choice == '4':
            print("\n--- BATTLE ARENA ---")
            print("Select first animal:")
            animals = list(game_data.animals.values())
            for idx, animal in enumerate(animals, 1):
                print(f"{idx}. {animal.name} ({animal.type})")
            
            try:
                choice1 = int(input("\nEnter first animal number: ")) - 1
                animal1 = animals[choice1]
                
                print(f"\nSelect attribute for {animal1.name}:")
                for idx, attr in enumerate(animal1.attributes, 1):
                    print(f"{idx}. {attr}")
                attr1_idx = int(input("Enter attribute number: ")) - 1
                attr1 = animal1.attributes[attr1_idx]
                
                print("\nSelect second animal:")
                for idx, animal in enumerate(animals, 1):
                    print(f"{idx}. {animal.name} ({animal.type})")
                
                choice2 = int(input("\nEnter second animal number: ")) - 1
                animal2 = animals[choice2]
                
                print(f"\nSelect attribute for {animal2.name}:")
                for idx, attr in enumerate(animal2.attributes, 1):
                    print(f"{idx}. {attr}")
                attr2_idx = int(input("Enter attribute number: ")) - 1
                attr2 = animal2.attributes[attr2_idx]
                
                # Battle!
                result = game_data.battle(animal1.id, attr1, animal2.id, attr2)
                
                print("\n=== BATTLE RESULTS ===")
                print(f"{animal1.name}'s {attr1} vs {animal2.name}'s {attr2}")
                print(result['message'])
                
            except (ValueError, IndexError):
                print("Invalid selection. Please try again.")
        
        elif choice == '5':
            print("\n--- AWARDS ---")
            for award in game_data.awards.values():
                print(f"\n{award.name} ({award.year})")
                print(f"Category: {award.category}")
                print(f"Description: {award.description}")
                winners = game_data.get_animals_by_award(award.id)
                if winners:
                    print("Winners: " + ", ".join([w.name for w in winners]))
                else:
                    print("No winners yet")
        
        elif choice == '6':
            print("\nThanks for playing Cosmic Animal Awards!")
            break
        
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
