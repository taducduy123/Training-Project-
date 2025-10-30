from sqlalchemy.orm import Session
from src.todos.models import Todo
from src.todos.schemas import TodoCreate, TodoUpdate
from src.todos.exceptions import TodoNotFoundException
from sqlalchemy import or_, and_  # ✅ add this import

class TodoService:
    """Business logic for Todo operations"""

    def __init__(self, db: Session):
        self.db = db

    # -----------------------------
    # CRUD Operations
    # -----------------------------
    def get_todo_by_id(self, todo_id: int) -> Todo:
        todo = self.db.query(Todo).filter(Todo.id == todo_id).first()
        if not todo:
            raise TodoNotFoundException(todo_id)
        return todo

    def create_todo(self, todo_data: TodoCreate) -> Todo:
        db_todo = Todo(
            title=todo_data.title,
            description=todo_data.description,
            is_completed=todo_data.is_completed,
        )
        self.db.add(db_todo)
        self.db.commit()
        self.db.refresh(db_todo)
        return db_todo

    def update_todo(self, todo_id: int, todo_data: TodoUpdate) -> Todo:
        todo = self.get_todo_by_id(todo_id)
        for key, value in todo_data.model_dump(exclude_unset=True).items():
            setattr(todo, key, value)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def delete_todo(self, todo_id: int):
        todo = self.get_todo_by_id(todo_id)
        self.db.delete(todo)
        self.db.commit()

    # -----------------------------
    # Pagination helpers
    # -----------------------------
    def _paginate_query(self, query, skip: int, limit: int):
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return {"total": total, "items": items}

    def get_all_todos_paginated(self, skip=0, limit=10, search=None):
        try:
            query = self.db.query(Todo)

            if search:
                # Split search text into words, ignoring extra spaces
                keywords = [w.strip() for w in search.split() if w.strip()]
                if keywords:
                    # Build OR filter for each keyword
                    for word in keywords:
                        query = query.filter(
                            or_(
                                Todo.title.ilike(f"%{word}%"),
                                Todo.description.ilike(f"%{word}%")
                            )
                        )

            query = query.order_by(Todo.id.desc())
            total = query.count()
            items = query.offset(skip).limit(limit).all()

            return {"total": total, "items": items}

        except Exception as e:
            print(f"❌ Error in get_all_todos_paginated: {e}")
            raise


    def get_pending_todos_paginated(self, skip=0, limit=10, search=None):
        try:
            query = self.db.query(Todo).filter(Todo.is_completed == False)

            if search:
                # Split search text into words, ignoring extra spaces
                keywords = [w.strip() for w in search.split() if w.strip()]
                if keywords:
                    # Build OR filter for each keyword
                    for word in keywords:
                        query = query.filter(
                            or_(
                                Todo.title.ilike(f"%{word}%"),
                                Todo.description.ilike(f"%{word}%")
                            )
                        )

            query = query.order_by(Todo.id.desc())
            total = query.count()
            items = query.offset(skip).limit(limit).all()

            return {"total": total, "items": items}

        except Exception as e:
            print(f"❌ Error in get_pending_todos_paginated: {e}")
            raise


    def get_completed_todos_paginated(self, skip=0, limit=10, search=None):
     try:
        query = self.db.query(Todo).filter(Todo.is_completed == True)

        if search:
                # Split search text into words, ignoring extra spaces
                keywords = [w.strip() for w in search.split() if w.strip()]
                if keywords:
                    # Build OR filter for each keyword
                    for word in keywords:
                        query = query.filter(
                            or_(
                                Todo.title.ilike(f"%{word}%"),
                                Todo.description.ilike(f"%{word}%")
                            )
                        )

        query = query.order_by(Todo.id.desc())
        total = query.count()
        items = query.offset(skip).limit(limit).all()

        return {"total": total, "items": items}

     except Exception as e:
        print(f"❌ Error in get_completed_todos_paginated: {e}")
        raise

