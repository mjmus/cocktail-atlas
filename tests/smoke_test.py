"""Smoke test without requesting the live Decent site. Run from repository root."""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import threading
import json
import os
from functools import partial
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SAMPLE = {
    'name': 'Margarita', 'book': 'pdt', 'description': 'Tequila with lime and orange.',
    'ingredients': [
        {'name': 'El Tesoro Platinum Tequila', 'amount': '2 oz', 'grams': 56.1, 'role': 'add', 'category': 'tequila'},
        {'name': 'Lime Juice', 'amount': '.75 oz', 'grams': 22.8, 'role': 'add', 'category': 'juice'},
        {'name': 'Lime Wheel', 'amount': '1', 'grams': None, 'role': 'garnish', 'category': 'fruit'},
    ], 'method': 'Shake with ice, then strain into chilled glass.', 'glass': 'Rocks',
    'source_book': {'title': 'The PDT Cocktail Book', 'authors': 'Jim Meehan'},
    'stats': {'abv_percent': 16, 'sugar_g': 9, 'acid_percent': .65, 'volume_ml': 205},
    'similar': [{'name': 'Negroni'}], 'also_in': [], 'image_url': '',
    'web_url': 'https://decentespresso.com/cocktails/pdt/recipes/Margarita',
}


def api_response(route):
    from urllib.parse import unquote
    url = unquote(route.request.url)
    if '/recipes?' in url:
        return {'ok': True, 'total': 3, 'items': [{'name': n} for n in ['Margarita', 'Negroni', 'Daiquiri']]}
    if '/ingredients?' in url:
        return {'ok': True, 'total': 2, 'items': [{'name': 'Lime Juice'}, {'name': 'Campari'}]}
    if '/ingredients/' in url:
        return {'ok': True, 'name': 'Lime Juice', 'category': 'juice', 'abv_percent': 0, 'cocktails': [{'name': 'Margarita'}]}
    if '/search?' in url:
        return {'ok': True, 'cocktails': [{'name': 'Margarita'}], 'ingredients': [{'name': 'Lime Juice'}]}
    return {'ok': True, **SAMPLE}


def main():
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    httpd = ThreadingHTTPServer(('127.0.0.1', 0), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    base = f'http://127.0.0.1:{httpd.server_port}/'
    errors = []
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox', '--disable-dev-shm-usage'])
            for viewport in [{'width': 1280, 'height': 900}, {'width': 390, 'height': 844}]:
                page = browser.new_page(viewport=viewport, reduced_motion='reduce')
                page.route('https://decentespresso.com/cocktails/api/**', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(api_response(r))))
                # External assets are deliberately not shipped with the repo.
                page.route('https://fast.decentespresso.com/**', lambda r: r.abort())
                page.route('https://fonts.googleapis.com/**', lambda r: r.abort())
                page.route('https://fonts.gstatic.com/**', lambda r: r.abort())
                page.on('pageerror', lambda e: errors.append(str(e)))
                page.goto(base)
                page.wait_for_selector('h1:has-text("Choose a cocktail book")')
                page.goto(base + '#/pdt')
                page.wait_for_selector('h1:has-text("300")')
                page.goto(base + '#/pdt/recipes')
                page.wait_for_selector('.rcard')
                assert page.locator('.rcard').count() >= 3
                page.goto(base + '#/pdt/recipe/Margarita')
                page.wait_for_selector('.step')
                assert page.locator('.ingredient-hero .isi').count() == 3
                assert page.locator('.step-amount strong').first.inner_text() == '56.1 g'
                page.locator('#plusQty').click()
                assert page.locator('.step-amount strong').first.inner_text() == '112.2 g'
                page.locator('#favBtn').click()
                page.locator('#scaleBtn').click()
                assert page.get_by_text('Preview the weighed steps').count() > 0
                page.locator('#closeModal').click()
                page.goto(base + '#/help')
                page.wait_for_selector('h1:has-text("Help")')
                assert page.locator('.help-section').count() > 10
                page.goto(base + '#/saved')
                page.wait_for_selector('h1:has-text("My lists")')
                assert page.get_by_text('Margarita').count() > 0
                page.screenshot(path=str(ROOT / f'tests/screenshot-{viewport["width"]}.png'), full_page=True)
                page.close()
            browser.close()
    finally:
        httpd.shutdown()
        thread.join(timeout=2)
    if errors:
        raise AssertionError('JavaScript page errors: ' + '; '.join(errors))
    print('PASS: desktop + mobile, navigation, catalog, recipe, grams, wishlist, making preview and help')


if __name__ == '__main__':
    main()
