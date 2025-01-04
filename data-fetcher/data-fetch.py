from gpt_scraper import GPTScraper
from gpt_scraper.selenium_utils import fetch_dynamic_page
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Literal
import os
import csv
import nltk
from bs4 import BeautifulSoup

nltk.download('punkt')
nltk.download('punkt_tab')


load_dotenv()

class Data(BaseModel):
    name: str
    free_or_paid: str
    description: str
    start_date: str
    end_end: str

page_source = fetch_dynamic_page("https://www.nationalgallery.org.uk/exhibitions/ng-stories", wait_condition={"by": "tag name", "value": "main"}, delay=5)

soup = BeautifulSoup(page_source, 'html.parser')
main_content = soup.find('main')

if main_content:
    page_source = str(main_content)
else:
    print("No <main> tag found in the page source.")


scraper = GPTScraper.from_html(
    page_source,
    "extract details about an exhibition",
    data_structure=Data,
    model_name="gpt-4o"
)

data = scraper.parse_html(page_source, use_sandbox=True)

# Export to TSV
tsv_file_path = './output.tsv'
with open(tsv_file_path, mode='w', newline='') as file:
    writer = csv.writer(file, delimiter='\t')
    writer.writerow(Data.__fields__.keys())  # Write header
    for item in data:
        writer.writerow(item.dict().values())

print(f"Data exported to {tsv_file_path}")