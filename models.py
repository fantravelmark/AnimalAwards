from dataclasses import dataclass, field
from typing import List, Dict, Optional, Union
import json
from pathlib import Path

@dataclass
class Animal:
    id: str
    name: str
    type: str  # 'earth' or 'alien'
    image: str
    description: str
    habitat: str
    fun_fact: str
    attributes: List[str]
    awards: List[str] = field(default_factory=list)

@dataclass
class Award:
    id: str
    name: str
    description: str
    category: str
    year: int

@dataclass
class AttributeRelationship:
    attribute: str
    beats: List[str]
    loses_to: List[str]
    description: str

class GameData:
    def __init__(self):
        self.animals: Dict[str, Animal] = {}
        self.awards: Dict[str, Award] = {}
        self.relationships: Dict[str, AttributeRelationship] = {}
    
    def load_data(self, data_dir: str = '.'):
        """Load all game data from JSON files"""
        # Load earth animals
        with open(Path(data_dir) / 'earth_animals.json', 'r') as f:
            earth_data = json.load(f)
            for animal_data in earth_data['animals']:
                animal = Animal(**animal_data)
                self.animals[animal.id] = animal
        
        # Load alien animals
        with open(Path(data_dir) / 'alien_animals.json', 'r') as f:
            alien_data = json.load(f)
            for animal_data in alien_data['animals']:
                animal = Animal(**animal_data)
                self.animals[animal.id] = animal
        
        # Load awards
        with open(Path(data_dir) / 'awards.json', 'r') as f:
            awards_data = json.load(f)
            for award_data in awards_data['awards']:
                award = Award(**award_data)
                self.awards[award.id] = award
        
        # Load attribute relationships
        with open(Path(data_dir) / 'attributes.json', 'r') as f:
            rels_data = json.load(f)
            for rel_data in rels_data['relationships']:
                rel = AttributeRelationship(**rel_data)
                self.relationships[rel.attribute] = rel
    
    def battle(self, animal1_id: str, attribute1: str, animal2_id: str, attribute2: str) -> Dict:
        """Simulate a battle between two animals based on their attributes"""
        animal1 = self.animals.get(animal1_id)
        animal2 = self.animals.get(animal2_id)
        
        if not animal1 or not animal2:
            return {"error": "One or both animals not found"}
        
        if attribute1 not in animal1.attributes:
            return {"error": f"{animal1.name} doesn't have attribute: {attribute1}"}
            
        if attribute2 not in animal2.attributes:
            return {"error": f"{animal2.name} doesn't have attribute: {attribute2}"}
        
        if attribute1 == attribute2:
            return {
                "winner": None,
                "message": f"It's a tie! Both used {attribute1}",
                "animal1": animal1.name,
                "animal2": animal2.name,
                "attribute1": attribute1,
                "attribute2": attribute2
            }
        
        rel1 = self.relationships.get(attribute1, AttributeRelationship(attribute1, [], [], ""))
        rel2 = self.relationships.get(attribute2, AttributeRelationship(attribute2, [], [], ""))
        
        if attribute2 in rel1.beats:
            winner = animal1
            loser = animal2
            winning_attr = attribute1
            losing_attr = attribute2
        elif attribute1 in rel2.beats:
            winner = animal2
            loser = animal1
            winning_attr = attribute2
            losing_attr = attribute1
        else:
            return {
                "winner": None,
                "message": "No clear winner - attributes don't directly counter each other",
                "animal1": animal1.name,
                "animal2": animal2.name,
                "attribute1": attribute1,
                "attribute2": attribute2
            }
        
        return {
            "winner": winner.id,
            "winner_name": winner.name,
            "loser_name": loser.name,
            "winning_attribute": winning_attr,
            "losing_attribute": losing_attr,
            "message": f"{winner.name}'s {winning_attr} beats {loser.name}'s {losing_attr}!"
        }
    
    def get_animals_by_type(self, animal_type: str) -> List[Animal]:
        """Get all animals of a specific type (earth/alien)"""
        return [a for a in self.animals.values() if a.type == animal_type]
    
    def get_animal(self, animal_id: str) -> Optional[Animal]:
        """Get an animal by its ID"""
        return self.animals.get(animal_id)
    
    def get_award(self, award_id: str) -> Optional[Award]:
        """Get an award by its ID"""
        return self.awards.get(award_id)
    
    def get_animals_by_award(self, award_id: str) -> List[Animal]:
        """Get all animals that have won a specific award"""
        return [a for a in self.animals.values() if award_id in a.awards]
