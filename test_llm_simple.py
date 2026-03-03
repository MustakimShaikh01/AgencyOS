from llama_cpp import Llama
import os

model_path = "/Users/mustakimshaikh/Downloads/autoos/models/qwen1_5-1_8b-chat-q4_k_m.gguf"
if not os.path.exists(model_path):
    print(f"Model {model_path} not found")
else:
    print(f"Loading {model_path}...")
    try:
        llm = Llama(model_path=model_path, n_ctx=512, verbose=False)
        print("Generating...")
        output = llm("Q: Name a planet. A: ", max_tokens=10, stop=["\n"])
        print(f"Output: {output['choices'][0]['text']}")
    except Exception as e:
        print(f"Error: {e}")
