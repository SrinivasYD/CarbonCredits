// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// import the required openzeppelin contracts to facilitate integration
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCreditNFTMarketplace is Ownable(msg.sender) {
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isSold;
    }

    IERC721 public carbonCreditNFT;
    mapping(uint256 => Listing) public listings;

    event NFTListed(uint256 tokenId, address seller, uint256 price);
    event NFTSold(uint256 tokenId, address buyer, uint256 price);

    constructor(address _carbonCreditNFT) {
        carbonCreditNFT = IERC721(_carbonCreditNFT);
    }

    /**
     * @notice List an NFT for sale.
     * @param tokenId The ID of the NFT.
     * @param price The price in Wei.
     */
    function listNFT(uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be greater than zero");
        require(carbonCreditNFT.ownerOf(tokenId) == msg.sender, "You are not the owner");

        carbonCreditNFT.transferFrom(msg.sender, address(this), tokenId);

        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isSold: false
        });

        emit NFTListed(tokenId, msg.sender, price);
    }

    /**
     * @notice Purchase an NFT.
     * @param tokenId The ID of the NFT to purchase.
     */
    function purchaseNFT(uint256 tokenId) external payable {
        Listing storage listing = listings[tokenId];
        require(!listing.isSold, "NFT is already sold");
        require(msg.value >= listing.price, "Insufficient funds");

        // Mark NFT as sold
        listing.isSold = true;

        // Transfer payment to the seller
        payable(listing.seller).transfer(listing.price);

        // Transfer NFT to the buyer
        carbonCreditNFT.safeTransferFrom(address(this), msg.sender, tokenId);

        emit NFTSold(tokenId, msg.sender, listing.price);
    }

    /**
     * @notice Withdraw the funds accumulated in the contract.
     */
    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @notice Set a new price for a listed NFT.
     * @param tokenId The ID of the NFT.
     * @param newPrice The new price in Wei.
     */
    function setPrice(uint256 tokenId, uint256 newPrice) external {
        Listing storage listing = listings[tokenId];
        require(msg.sender == listing.seller, "Only the seller can set the price");
        listing.price = newPrice;
    }

    /**
     * @notice Cancel a listing.
     * @param tokenId The ID of the NFT to cancel.
     */
    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(msg.sender == listing.seller, "Only the seller can cancel");

        // Transfer NFT back to the seller
        carbonCreditNFT.safeTransferFrom(address(this), msg.sender, tokenId);
        delete listings[tokenId];
    }
}
