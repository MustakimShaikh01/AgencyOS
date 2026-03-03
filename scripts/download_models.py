import asyncio
import argparse
from app.llm.hf_client import download_model

async def main():
    parser = argparse.ArgumentParser(description="Download AgencyOS local quantized LLMs.")
    parser.add_argument(
        "--models", 
        nargs="+", 
        choices=["tinyllama", "qwen", "mistral"], 
        default=["tinyllama", "qwen"],
        help="Specify which models to download."
    )
    
    args = parser.parse_args()
    
    print(f"Starting downloads for: {', '.join(args.models)} \n")
    
    tasks = [download_model(model) for model in args.models]
    await asyncio.gather(*tasks)
    
    print("\nAll downloads completed successfully.")

if __name__ == "__main__":
    asyncio.run(main())
