import unittest
import json
from instagram_clone.app import app, db, User

class AuthTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_signup(self):
        response = self.app.post('/signup', data=json.dumps(dict(
            username='testuser',
            password='testpassword'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_login(self):
        # First, create a user to log in with
        with app.app_context():
            new_user = User(username='testuser')
            new_user.set_password('testpassword')
            db.session.add(new_user)
            db.session.commit()

        response = self.app.post('/login', data=json.dumps(dict(
            username='testuser',
            password='testpassword'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()
