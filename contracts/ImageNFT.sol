// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ImageNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    // Base URI dell'API di metadati
    string private _baseTokenURI;

    // Evento emesso quando un nuovo NFT viene creato
    event Minted(address indexed owner, uint256 indexed tokenId);

    // Struct per i dati di metadata
    struct TokenMetadata {
        string name;
        string description;
        string imageURI;
        // Altri dati di metadata che desideri includere
    }

    // Mappa per associare l'ID del token ai dati di metadata
    mapping(uint256 => TokenMetadata) private _tokenMetadata;

    // Costruttore del contratto
    constructor(string memory name, string memory symbol, string memory baseTokenURI) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
    }

    // Funzione per impostare il base URI dell'API di metadati
    function setBaseURI(string memory baseTokenURI) external onlyOwner {
        _baseTokenURI = baseTokenURI;
    }

    // Funzione per creare un nuovo NFT collegato a un'immagine tramite IPFS
    function mint(string memory name, string memory description, string memory imageURI) external onlyOwner {
        uint256 tokenId = totalSupply() + 1;
        _safeMint(msg.sender, tokenId);

        // Memorizza i dati di metadata associati al token
        _tokenMetadata[tokenId] = TokenMetadata({
            name: name,
            description: description,
            imageURI: imageURI
        });

        // Emetti l'evento Minted
        emit Minted(msg.sender, tokenId);
    }

// Funzione per verificare l'esistenza di un token
function _tokenExists(uint256 tokenId) internal view returns (bool) {
    return _owners[tokenId] != address(0);
}
// Funzione per ottenere l'URI completo del token
function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_tokenExists(tokenId), "URI query for nonexistent token");

    // Estrai i dati di metadata associati al token
    TokenMetadata memory metadata = _tokenMetadata[tokenId];

    // Concatena i dati al base URI
    return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), "/", metadata.name, "/", metadata.description, "/", metadata.imageURI));
}

}
