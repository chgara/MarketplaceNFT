import { useState } from 'react';
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import Web3Modal from 'web3modal';

const client = ipfsHttpClient({
	host: 'ipfs.infura.io',
	port: 5001,
	protocol: 'https',
});

import { nftAddress, nftMarketAddress } from '../../config';
import NFT from '../../artifacts/contracts/NFT.sol/NFT.json';
import NFTMarket from '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

export default function CreateItem() {
	const [fileUrl, setFileUrl] = useState(null);
	const [formInput, updateFormInput] = useState({
		price: '',
		name: '',
		description: '',
	});
	const router = useRouter();

	async function onChange(e) {
		const file = e.target.files[0];
		try {
			const added = await client.add(file, {
				progress: prop => console.log('received ' + prop),
			});
			const url = `https://ipfs.infura.io/ipfs/${added.path}`;
			console.log(url);
			setFileUrl(url);
		} catch (error) {
			console.error(error);
		}
	}

	async function createItem() {
		const { name, description, price } = formInput;
		if (!name || !description || !price || !fileUrl) {
			return;
		}
		const data = JSON.stringify({
			name,
			description,
			image: fileUrl,
		});
		try {
			const added = await client.add(data, {
				progress: prop => console.log('received ' + prop),
			});
			const url = `https://ipfs.infura.io/ipfs/${added.path}`;
			//Save it to polygon
			console.log(url);
			createSale(url);
		} catch (error) {
			console.error('Error uploading the file', error);
		}
	}

	async function createSale(url) {
		const web3modal = new Web3Modal();
		const connection = await web3modal.connect();
		const provider = new ethers.providers.Web3Provider(
			connection
		);
		const signer = provider.getSigner();

		let contract = new ethers.Contract(
			nftAddress,
			NFT.abi,
			signer
		);

		let transaction = await contract.createToken(url);
		let tx = await transaction.wait();

		let event = tx.events[0];
		let value = event.args[2];
		let tokenId = value.toNumber();

		const price = new ethers.utils.parseUnits(
			formInput.price,
			'ether'
		);
		contract = new ethers.Contract(
			nftMarketAddress,
			NFTMarket.abi,
			signer
		);
		let listingPrice = await contract.getListingPrice();
		listingPrice = listingPrice.toString();
		transaction = await contract.createMarketItem(
			nftAddress,
			tokenId,
			price,
			{ value: listingPrice }
		);
		tx = await transaction.wait();
		router.push('/');
		return;
	}

	return (
		<div className='flex justify-center'>
			<div className='w-1/2 flex flex-col pb-12'>
				<input
					className='mt-8 border rounded p-4'
					type='text'
					placeholder='Asset Name'
					onChange={e =>
						updateFormInput({
							...formInput,
							name: e.target.value,
						})
					}
				/>
				<textarea
					className='mt-2 border rounded p-4'
					name='description'
					onChange={e =>
						updateFormInput({
							...formInput,
							description: e.target.value,
						})
					}
				/>
				<input
					className='mt-2 border rounded p-4'
					type='text'
					placeholder='Asset Price in Matic'
					onChange={e =>
						updateFormInput({
							...formInput,
							price: e.target.value,
						})
					}
				/>
				<input
					className='mt-4'
					type='file'
					placeholder='Asset'
					onChange={onChange}
				/>
				{fileUrl && (
					<img
						className='mt-4 rounded'
						src={fileUrl}
						alt='Asset'
						width='350'
					/>
				)}
				<button
					onClick={createItem}
					className='font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg'
				>
					Create Digital Asset
				</button>
			</div>
		</div>
	);
}
