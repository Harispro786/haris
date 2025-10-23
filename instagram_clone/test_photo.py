import unittest
import os
import json
from instagram_clone.app import app, db, User, Photo

class PhotoTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['UPLOAD_FOLDER'] = 'test_uploads'
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        self.app = app.test_client()
        with app.app_context():
            db.create_all()
            # Create a user and log in
            new_user = User(username='testuser')
            new_user.set_password('testpassword')
            db.session.add(new_user)
            db.session.commit()
            self.app.post('/login', data=json.dumps(dict(
                username='testuser',
                password='testpassword'
            )), content_type='application/json')

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()
        for f in os.listdir(app.config['UPLOAD_FOLDER']):
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], f))
        os.rmdir(app.config['UPLOAD_FOLDER'])

    def test_upload_photo(self):
        with open('instagram_clone/test_photo.jpg', 'rb') as img:
            response = self.app.post('/upload',
                                     data={'photo': (img, 'test_photo.jpg')},
                                     content_type='multipart/form-data')
        self.assertEqual(response.status_code, 201)
        with app.app_context():
            self.assertEqual(Photo.query.count(), 1)
            self.assertEqual(Photo.query.first().filename, 'test_photo.jpg')

    def test_feed(self):
        # Upload a photo first
        with open('instagram_clone/test_photo.jpg', 'rb') as img:
            self.app.post('/upload',
                          data={'photo': (img, 'test_photo.jpg')},
                          content_type='multipart/form-data')

        response = self.app.get('/feed')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['filename'], 'test_photo.jpg')
        self.assertEqual(data[0]['user'], 'testuser')

if __name__ == '__main__':
    unittest.main()
