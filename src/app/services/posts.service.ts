import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Post } from '../interfaces/post';
import { Comment } from '../interfaces/comment';
import { firestore } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  constructor(private db: AngularFirestore) {}

  get getAllPosts() {
    return this.db.collection<Post>('posts').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Post;
        const id = a.payload.doc.id;
        const ref = a.payload.doc.ref;
        return { id, ref, ...data };
      }))
    );
  }

  getCommentsForPost(post: Post) {
    return this.db.doc(post.ref).collection('comments').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Post;
        const id = a.payload.doc.id;
        const ref = a.payload.doc.ref;
        return { id, ref, ...data };
      }))
    );
  }

  createPost(post: Post) {
    return new Promise((resolve, reject) => {
      this.db.collection<Post>('posts').add(post) // Add a new post to the posts collection in Firebase
        .then(data => resolve(data))
        .catch(err => reject(err));
    });
  }

  addCommentToPost(post: Post, comment: Comment) {
    return new Promise((resolve, reject) => { // Add a new comment to the comments subcollection of a post
      post.ref.collection('comments').add(comment)
        .then(data => {
          this.db.doc(`users/${post.postedBy}`).update({ comments: firestore.FieldValue.arrayUnion(data.id) }).then(() => resolve(data));
        })
        .catch(err => reject(err));
    });
  }

  // TODO: Make the same method as above, but with likes.
  // TODO: Add a method for deleting posts
  deletePost(post: Post) {
    console.log(`Deleting post ${post.ref.path}`);
  }
  // TODO: Add a method for deleting comments
  deleteCommentFromPost(comment: Comment) {
    console.log(`Deleting comment ${comment.ref.path}.`);
  }
  // TODO: Add a method for editing posts
  // TODO: Add a method for editing comments
}
