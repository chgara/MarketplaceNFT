const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('NFTMarketPlace', function () {
	it('Should create and execute a new Sale', async function () {
		const Market = await ethers.getContractFactory('NFTMarket');
		const market = await Market.deploy();
		await market.deployed();
		const marketAddress = await market.address;

		const NFT = await ethers.getContractFactory('NFT');
		const nft = await NFT.deploy(marketAddress);
		await nft.deployed();
		const nftAddress = await nft.address;

		let listingPrice = await market.getListingPrice();
		listingPrice = listingPrice.toString();

		const auctionPrice = ethers.utils.parseUnits('100', 'ether');

		await nft.createToken('https://www.mytoken1.com');
		await nft.createToken('https://www.mytoken2.com');

		await market.createMarketItem(nftAddress, 1, auctionPrice, {
			value: listingPrice,
		});
		await market.createMarketItem(nftAddress, 2, auctionPrice, {
			value: listingPrice,
		});

		const [_, buyerAddress] = await ethers.getSigners();

		await market
			.connect(buyerAddress)
			.createMarketSale(nftAddress, 1, { value: auctionPrice });
		await market
			.connect(buyerAddress)
			.createMarketSale(nftAddress, 2, { value: auctionPrice });

		let items = await market.fetchMarketItems();

		items = await Promise.all(
			items.map(async i => {
				console.log(i.tokenId);
				// const tokenURI = await nft.tokenURI(i.tokenId);
				let item = {
					price: i.price.toString(),
					tokenId: i.tokenId.toString(),
					owner: i.owner,
					seller: i.seller,
					// tokenURI,
				};
				return item;
			})
		);
		console.log('items', items);
	});
});
